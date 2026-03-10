import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IELTS_SYSTEM_PROMPT, buildUserPrompt } from './rubric.prompt';
import { validateFeedbackSchema, IeltsFeedback } from './schema-validator';

@Injectable()
export class LlmClientService {
    private readonly logger = new Logger(LlmClientService.name);
    private openai: OpenAI | null = null;
    private google: GoogleGenerativeAI | null = null;

    constructor(private readonly config: ConfigService) {
        const openaiKey = config.get<string>('OPENAI_API_KEY');
        if (openaiKey) {
            this.openai = new OpenAI({ apiKey: openaiKey });
        }

        const googleKey = config.get<string>('GOOGLE_API_KEY');
        if (googleKey) {
            this.google = new GoogleGenerativeAI(googleKey);
        }
    }

    async generateJson<T = any>(opts: {
        systemPrompt: string;
        userPrompt: string;
        modelTier: 'cheap' | 'premium';
    }): Promise<{ data: T; modelName: string }> {
        const provider = this.config.get<string>('LLM_PROVIDER', 'openai');
        const fallback = this.config.get<string>('LLM_FALLBACK_PROVIDER', 'google');

        let raw: string | null = null;
        let modelName = '';

        try {
            if (provider === 'openai' && this.openai) {
                const model = opts.modelTier === 'premium'
                    ? this.config.get<string>('LLM_MODEL_PREMIUM', 'gpt-4o')
                    : this.config.get<string>('LLM_MODEL_CHEAP', 'gpt-4o-mini');
                modelName = model!;
                raw = await this.callOpenAI(model!, opts.systemPrompt, opts.userPrompt);
            } else if (provider === 'google' && this.google) {
                const model = opts.modelTier === 'premium' ? 'gemini-2.5-flash' : 'gemini-2.5-flash';
                modelName = model;
                raw = await this.callGoogle(model, opts.systemPrompt, opts.userPrompt);
            }
        } catch (err) {
            this.logger.warn(`Primary provider (${provider}) failed: ${(err as Error).message}`);
        }

        if (!raw) {
            try {
                if (fallback === 'google' && this.google) {
                    const model = 'gemini-2.5-flash';
                    modelName = `${model}-fallback`;
                    raw = await this.callGoogle(model, opts.systemPrompt, opts.userPrompt);
                } else if (fallback === 'openai' && this.openai) {
                    const model = 'gpt-4o-mini';
                    modelName = `${model}-fallback`;
                    raw = await this.callOpenAI(model, opts.systemPrompt, opts.userPrompt);
                }
            } catch (err) {
                this.logger.warn(`Fallback provider (${fallback}) failed: ${(err as Error).message}`);
            }
        }

        if (!raw) {
            throw new Error('All LLM providers failed or no API keys configured');
        }

        try {
            // some models wrap json in ```json ... ```
            const cleanRaw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            const data = JSON.parse(cleanRaw);
            return { data, modelName };
        } catch (e) {
            this.logger.error(`Failed to parse LLM JSON response: ${raw}`);
            throw new Error('Invalid JSON from LLM');
        }
    }

    async scoreEssay(opts: {
        promptText: string;
        essayContent: string;
        modelTier: 'cheap' | 'premium';
    }): Promise<{ feedback: IeltsFeedback; modelName: string }> {
        const userPrompt = buildUserPrompt(opts.promptText, opts.essayContent);
        const { data, modelName } = await this.generateJson({
            systemPrompt: IELTS_SYSTEM_PROMPT,
            userPrompt,
            modelTier: opts.modelTier,
        });

        // ensure schema matches
        const feedback = validateFeedbackSchema(JSON.stringify(data));
        return { feedback, modelName };
    }

    private async callOpenAI(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
        const response = await this.openai!.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
        });
        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned empty response');
        return content;
    }

    private async callGoogle(model: string, systemPrompt: string, userPrompt: string, retries = 2): Promise<string> {
        try {
            const genModel = this.google!.getGenerativeModel({
                model,
                generationConfig: { responseMimeType: 'application/json' }
            });
            const result = await genModel.generateContent(
                `${systemPrompt}\n\n${userPrompt}`,
            );
            const text = result.response.text();
            if (!text) throw new Error('Google returned empty response');
            return text;
        } catch (e: any) {
            if ((e.status === 429 || e.status === 503) && retries > 0) {
                let delayMs = 15000;
                const match = e.message?.match(/retry in ([\d\.]+)s/);
                if (match && match[1]) {
                    delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
                }
                this.logger.warn(`Google API ${e.status} (${e.status === 429 ? 'Rate Limit' : 'Service Unavailable'}). Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                return this.callGoogle(model, systemPrompt, userPrompt, retries - 1);
            }
            throw e;
        }
    }

    /** Send a file (PDF, image, etc.) directly to Gemini's multimodal API */
    async generateJsonWithFile<T = any>(opts: {
        systemPrompt: string;
        fileBuffer: Buffer;
        mimeType: string;
    }): Promise<{ data: T; modelName: string }> {
        if (!this.google) {
            throw new Error('Google API key is required for file-based parsing');
        }

        const model = 'gemini-2.5-flash';
        const modelName = model;

        const raw = await this.callGoogleWithFile(model, opts.systemPrompt, opts.fileBuffer, opts.mimeType);

        try {
            const cleanRaw = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            const data = JSON.parse(cleanRaw);
            return { data, modelName };
        } catch (e) {
            this.logger.error(`Failed to parse LLM JSON response: ${raw.substring(0, 500)}`);
            throw new Error('Invalid JSON from LLM');
        }
    }

    private async callGoogleWithFile(model: string, systemPrompt: string, fileBuffer: Buffer, mimeType: string, retries = 2): Promise<string> {
        try {
            const genModel = this.google!.getGenerativeModel({
                model,
                generationConfig: { responseMimeType: 'application/json' }
            });

            const filePart = {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType,
                },
            };

            const result = await genModel.generateContent([
                systemPrompt,
                filePart,
            ]);
            const text = result.response.text();
            if (!text) throw new Error('Google returned empty response');
            return text;
        } catch (e: any) {
            if ((e.status === 429 || e.status === 503) && retries > 0) {
                let delayMs = 15000;
                const match = e.message?.match(/retry in ([\d\.]+)s/);
                if (match && match[1]) {
                    delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
                }
                this.logger.warn(`Google API ${e.status} (file upload). Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                return this.callGoogleWithFile(model, systemPrompt, fileBuffer, mimeType, retries - 1);
            }
            throw e;
        }
    }
}

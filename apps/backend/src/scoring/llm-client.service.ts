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

    async scoreEssay(opts: {
        promptText: string;
        essayContent: string;
        modelTier: 'cheap' | 'premium';
    }): Promise<{ feedback: IeltsFeedback; modelName: string }> {
        const provider = this.config.get<string>('LLM_PROVIDER', 'openai');
        const fallback = this.config.get<string>('LLM_FALLBACK_PROVIDER', 'google');

        const userPrompt = buildUserPrompt(opts.promptText, opts.essayContent);

        let raw: string | null = null;
        let modelName = '';

        // Try primary provider
        try {
            if (provider === 'openai' && this.openai) {
                const model =
                    opts.modelTier === 'premium'
                        ? this.config.get<string>('LLM_MODEL_PREMIUM', 'gpt-4o')
                        : this.config.get<string>('LLM_MODEL_CHEAP', 'gpt-4o-mini');
                modelName = model!;
                raw = await this.callOpenAI(model!, userPrompt);
            } else if (provider === 'google' && this.google) {
                const model = opts.modelTier === 'premium' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
                modelName = model;
                raw = await this.callGoogle(model, userPrompt);
            }
        } catch (err) {
            this.logger.warn(`Primary provider (${provider}) failed: ${(err as Error).message}`);
        }

        // Fallback
        if (!raw) {
            try {
                if (fallback === 'google' && this.google) {
                    const model = 'gemini-1.5-flash';
                    modelName = `${model}-fallback`;
                    raw = await this.callGoogle(model, userPrompt);
                } else if (fallback === 'openai' && this.openai) {
                    const model = 'gpt-4o-mini';
                    modelName = `${model}-fallback`;
                    raw = await this.callOpenAI(model, userPrompt);
                }
            } catch (err) {
                this.logger.warn(`Fallback provider (${fallback}) failed: ${(err as Error).message}`);
            }
        }

        if (!raw) {
            throw new Error('All LLM providers failed or no API keys configured');
        }

        const feedback = validateFeedbackSchema(raw);
        return { feedback, modelName };
    }

    private async callOpenAI(model: string, userPrompt: string): Promise<string> {
        const response = await this.openai!.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: IELTS_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });
        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned empty response');
        return content;
    }

    private async callGoogle(model: string, userPrompt: string): Promise<string> {
        const genModel = this.google!.getGenerativeModel({ model });
        const result = await genModel.generateContent(
            `${IELTS_SYSTEM_PROMPT}\n\n${userPrompt}`,
        );
        const text = result.response.text();
        if (!text) throw new Error('Google returned empty response');
        return text;
    }
}

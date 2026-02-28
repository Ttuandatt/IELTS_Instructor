/**
 * Validates LLM JSON output against the IELTS feedback schema.
 * Throws if invalid so BullMQ can retry.
 */

export interface IeltsFeedback {
    TR: number;
    CC: number;
    LR: number;
    GRA: number;
    overall: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    suggestions: string;
}

const VALID_BANDS = new Set([0, 1, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]);

function isValidBand(value: unknown): boolean {
    return typeof value === 'number' && VALID_BANDS.has(value);
}

export function validateFeedbackSchema(raw: string): IeltsFeedback {
    let parsed: any;

    // Strip possible markdown code fences  
    const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`LLM response is not valid JSON: ${raw.slice(0, 200)}`);
    }

    const requiredScores: Array<keyof IeltsFeedback> = ['TR', 'CC', 'LR', 'GRA', 'overall'];
    for (const key of requiredScores) {
        if (!isValidBand(parsed[key])) {
            throw new Error(`Invalid band score for ${key}: ${parsed[key]}`);
        }
    }

    if (typeof parsed.summary !== 'string' || parsed.summary.trim().length === 0) {
        throw new Error('Missing or empty summary field');
    }

    if (!Array.isArray(parsed.strengths) || parsed.strengths.length === 0) {
        throw new Error('strengths must be a non-empty array');
    }

    if (!Array.isArray(parsed.improvements) || parsed.improvements.length === 0) {
        throw new Error('improvements must be a non-empty array');
    }

    if (typeof parsed.suggestions !== 'string' || parsed.suggestions.trim().length === 0) {
        throw new Error('Missing or empty suggestions field');
    }

    return parsed as IeltsFeedback;
}

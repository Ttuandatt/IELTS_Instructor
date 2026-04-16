import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { MammothParserService } from './mammoth-parser.service';

describe('MammothParserService', () => {
  const fixture = resolve(__dirname, '../../../../docs/IELTS Reading Practice Test 2.docx');
  let service: MammothParserService;

  beforeEach(() => {
    service = new MammothParserService();
  });

  it('parses the real IELTS DOCX with high confidence', async () => {
    const buffer = await fs.readFile(fixture);
    const result = await service.parse(buffer);

    expect(result.parser_used).toBe('mammoth');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.passage.title).toBe('Right and left-handedness in humans');
    expect(result.passage.body_html.length).toBeGreaterThan(2000);
    expect(result.questions).toHaveLength(12);
  });

  it('detects matching_features for Questions 1-7', async () => {
    const buffer = await fs.readFile(fixture);
    const result = await service.parse(buffer);
    const group = result.questions.filter((q) => q.number <= 7);
    expect(group).toHaveLength(7);
    expect(group.every((q) => q.type === 'matching_features')).toBe(true);
    expect(group[0].options).toHaveLength(5);
  });

  it('detects table_completion for Questions 8-10 with blank refs', async () => {
    const buffer = await fs.readFile(fixture);
    const result = await service.parse(buffer);
    const group = result.questions.filter((q) => q.number >= 8 && q.number <= 10);
    expect(group).toHaveLength(3);
    expect(group.every((q) => q.type === 'table_completion')).toBe(true);
    expect(group[0].blank_refs).toEqual(['blank_q8']);
    expect(group[2].blank_refs).toEqual(['blank_q10']);
  });

  it('detects mcq for Questions 11-12 with per-question options', async () => {
    const buffer = await fs.readFile(fixture);
    const result = await service.parse(buffer);
    const group = result.questions.filter((q) => q.number >= 11);
    expect(group).toHaveLength(2);
    expect(group.every((q) => q.type === 'mcq')).toBe(true);
    expect(group[0].options).toHaveLength(4);
    expect(group[1].options).toHaveLength(4);
    expect(group[1].stem).toContain('left-handed people');
  });

  it('extracts correct answers from answer key section', async () => {
    const buffer = await fs.readFile(fixture);
    const result = await service.parse(buffer);
    const byNum = new Map(result.questions.map((q) => [q.number, q.correct_answer]));
    expect(byNum.get(1)).toBe('B');
    expect(byNum.get(7)).toBe('E');
    expect(byNum.get(8)).toBe('15-20%');
    expect(byNum.get(10)).toBe('6%');
    expect(byNum.get(11)).toBe('D');
    expect(byNum.get(12)).toBe('B');
  });
});

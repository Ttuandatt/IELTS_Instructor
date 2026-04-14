import {
  SingleSelectStrategy,
  MatchingStrategy,
  FillInStrategy,
} from './grading-strategy';

describe('SingleSelectStrategy', () => {
  const strategy = new SingleSelectStrategy();

  it('MCQ: "b" vs "B" → correct', () => {
    expect(strategy.grade('b', 'B').isCorrect).toBe(true);
  });

  it('MCQ: "A" vs "B" → incorrect', () => {
    expect(strategy.grade('A', 'B').isCorrect).toBe(false);
  });

  it('T/F/NG: "true" vs "TRUE" → correct', () => {
    expect(strategy.grade('true', 'TRUE').isCorrect).toBe(true);
  });

  it('T/F/NG: "ng" vs "NOT GIVEN" → correct', () => {
    expect(strategy.grade('ng', 'NOT GIVEN').isCorrect).toBe(true);
  });

  it('T/F/NG: "false" vs "NOT GIVEN" → incorrect', () => {
    expect(strategy.grade('false', 'NOT GIVEN').isCorrect).toBe(false);
  });

  it('Y/N/NG: "y" vs "YES" → correct', () => {
    expect(strategy.grade('y', 'YES').isCorrect).toBe(true);
  });

  it('Y/N/NG: "no" vs "NO" → correct', () => {
    expect(strategy.grade('no', 'NO').isCorrect).toBe(true);
  });

  it('preserves original values in result', () => {
    const result = strategy.grade('ng', 'NOT GIVEN');
    expect(result.userAnswer).toBe('ng');
    expect(result.correctAnswer).toBe('NOT GIVEN');
  });
});

describe('MatchingStrategy', () => {
  const strategy = new MatchingStrategy();

  it('"ii" vs "ii" → correct', () => {
    expect(strategy.grade('ii', 'ii').isCorrect).toBe(true);
  });

  it('"C" vs "c" → correct', () => {
    expect(strategy.grade('C', 'c').isCorrect).toBe(true);
  });

  it('"A" vs "B" → incorrect', () => {
    expect(strategy.grade('A', 'B').isCorrect).toBe(false);
  });

  it('handles whitespace: " C " vs "c" → correct', () => {
    expect(strategy.grade(' C ', 'c').isCorrect).toBe(true);
  });
});

describe('FillInStrategy', () => {
  const strategy = new FillInStrategy();

  it('"carbon dioxide" vs "carbon dioxide" → correct', () => {
    expect(strategy.grade('carbon dioxide', 'carbon dioxide').isCorrect).toBe(true);
  });

  it('"carbon dioxide" vs ["carbon dioxide", "CO2"] → correct', () => {
    expect(strategy.grade('carbon dioxide', ['carbon dioxide', 'CO2']).isCorrect).toBe(true);
  });

  it('"CO2" vs ["carbon dioxide", "CO2"] → correct', () => {
    expect(strategy.grade('CO2', ['carbon dioxide', 'CO2']).isCorrect).toBe(true);
  });

  it('"carbon" vs "carbon dioxide" → INCORRECT (no includes)', () => {
    expect(strategy.grade('carbon', 'carbon dioxide').isCorrect).toBe(false);
  });

  it('"  Carbon Dioxide  " vs "carbon dioxide" → correct (trim + lowercase)', () => {
    expect(strategy.grade('  Carbon Dioxide  ', 'carbon dioxide').isCorrect).toBe(true);
  });

  it('"" (empty) vs "anything" → incorrect', () => {
    expect(strategy.grade('', 'anything').isCorrect).toBe(false);
  });

  it('"   " (whitespace only) vs "anything" → incorrect', () => {
    expect(strategy.grade('   ', 'anything').isCorrect).toBe(false);
  });

  it('"the migration" vs ["migration"] → incorrect (exact match)', () => {
    expect(strategy.grade('the migration', ['migration']).isCorrect).toBe(false);
  });

  it('collapses multiple spaces: "carbon  dioxide" vs "carbon dioxide" → correct', () => {
    expect(strategy.grade('carbon  dioxide', 'carbon dioxide').isCorrect).toBe(true);
  });
});

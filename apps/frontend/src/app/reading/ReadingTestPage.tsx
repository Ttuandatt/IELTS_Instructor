"use client";

import React, { useMemo, useState } from 'react';

import PassageColumn from '@/components/PassageColumn';
import QuestionColumn from '@/components/QuestionColumn';
import NavigationColumn from '@/components/NavigationColumn';
import mockReading from '@/data/mockReading.json';

const ReadingTestPage: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  const questions = useMemo(() => mockReading.questions, []);

  return (
    <main style={{ display: 'flex', height: '100vh', background: '#030712' }}>
      <section style={{ flex: 2.2, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
        <PassageColumn html={mockReading.passage.html} />
      </section>
      <section style={{ flex: 2, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
        <QuestionColumn questions={questions} selected={selectedQuestion} />
      </section>
      <NavigationColumn
        totalQuestions={questions.length}
        selected={selectedQuestion}
        onSelect={setSelectedQuestion}
      />
    </main>
  );
};

export default ReadingTestPage;

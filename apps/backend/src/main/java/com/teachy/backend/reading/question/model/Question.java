package com.teachy.backend.reading.question.model;

import com.teachy.backend.common.enums.QuestionType;
import com.teachy.backend.reading.passage.model.Passage;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passage_id", nullable = false)
    private Passage passage;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private QuestionType type;

    @Column(name = "prompt", columnDefinition = "text", nullable = false)
    private String prompt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options", columnDefinition = "jsonb")
    private Map<String, Object> options;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "answer_key", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> answerKey;

    @Column(name = "explanation", columnDefinition = "text")
    private String explanation;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;
}

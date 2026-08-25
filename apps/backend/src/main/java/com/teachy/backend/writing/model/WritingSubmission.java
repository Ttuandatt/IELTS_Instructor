package com.teachy.backend.writing.model;

import com.teachy.backend.classroom.model.Lesson;
import com.teachy.backend.common.enums.ModelTier;
import com.teachy.backend.common.enums.ProcessingStatus;
import com.teachy.backend.common.enums.SubmissionState;
import com.teachy.backend.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "submissions_writing")
@EntityListeners(AuditingEntityListener.class)
public class WritingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_id", nullable = false)
    private Prompt prompt;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "word_count", nullable = false)
    private int wordCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scores", columnDefinition = "jsonb")
    private Map<String, Object> scores;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "feedback", columnDefinition = "jsonb")
    private Map<String, Object> feedback;

    @Enumerated(EnumType.STRING)
    @Column(name = "model_tier", nullable = false)
    private ModelTier modelTier;

    @Column(name = "model_name", length = 50)
    private String modelName;

    @Column(name = "turnaround_ms")
    private Integer turnaroundMs;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false)
    private ProcessingStatus processingStatus;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "scored_at")
    private Instant scoredAt;

    @Column(name = "instructor_override_score")
    private Double instructorOverrideScore;

    @Column(name = "instructor_comment", columnDefinition = "text")
    private String instructorComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private SubmissionState state;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "instructor_scores", columnDefinition = "jsonb")
    private Map<String, Object> instructorScores;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "prompt_version", length = 10, nullable = false)
    private String promptVersion;

    @Column(name = "tokens_input")
    private Integer tokensInput;

    @Column(name = "tokens_output")
    private Integer tokensOutput;
}

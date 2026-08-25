package com.teachy.backend.reading.submission.model;

import com.teachy.backend.classroom.model.Lesson;
import com.teachy.backend.reading.passage.model.Passage;
import com.teachy.backend.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "submissions_reading")
@EntityListeners(AuditingEntityListener.class)
public class ReadingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passage_id", nullable = false)
    private Passage passage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "answers", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> answers;

    @Column(name = "score_pct", nullable = false)
    private double scorePct;

    @Column(name = "correct_count", nullable = false)
    private int correctCount;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "duration_sec")
    private Integer durationSec;

    @Column(name = "timed_out", nullable = false)
    private boolean timedOut;

    @Column(name = "test_mode", length = 20, nullable = false)
    private String testMode;

    @CreatedDate
    @Column(name = "completed_at", nullable = false, updatable = false)
    private Instant completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;
}

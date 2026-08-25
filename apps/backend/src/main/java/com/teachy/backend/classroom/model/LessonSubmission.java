package com.teachy.backend.classroom.model;

import com.teachy.backend.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "lesson_submissions")
@EntityListeners(AuditingEntityListener.class)
public class LessonSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "word_count", nullable = false)
    private int wordCount;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "score")
    private Double score;

    @Column(name = "feedback", columnDefinition = "text")
    private String feedback;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

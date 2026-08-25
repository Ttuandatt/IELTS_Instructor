package com.teachy.backend.classroom.model;

import com.teachy.backend.common.enums.ContentStatus;
import com.teachy.backend.common.enums.LessonContentType;
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
@Table(name = "lessons")
@EntityListeners(AuditingEntityListener.class)
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private LessonContentType contentType;

    @Column(name = "linked_entity_id")
    private UUID linkedEntityId;

    @Column(name = "attachment_url", columnDefinition = "text")
    private String attachmentUrl;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContentStatus status;

    @Column(name = "allow_submit", nullable = false)
    private boolean allowSubmit;

    @Column(name = "allow_checkscore", nullable = false)
    private boolean allowCheckscore;

    @Column(name = "due_at")
    private Instant dueAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

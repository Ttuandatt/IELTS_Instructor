package com.teachy.backend.writing.model;

import com.teachy.backend.common.enums.CefrLevel;
import com.teachy.backend.common.enums.ContentStatus;
import com.teachy.backend.common.enums.TaskType;
import com.teachy.backend.content.model.Collection;
import com.teachy.backend.content.model.TopicTag;
import com.teachy.backend.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "prompts")
@EntityListeners(AuditingEntityListener.class)
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false)
    private TaskType taskType;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "prompt_text", columnDefinition = "text", nullable = false)
    private String promptText;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private CefrLevel level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id")
    private Collection collection;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContentStatus status;

    @Column(name = "min_words", nullable = false)
    private int minWords;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "prompt_tags",
            joinColumns = @JoinColumn(name = "prompt_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<TopicTag> tags = new HashSet<>();
}

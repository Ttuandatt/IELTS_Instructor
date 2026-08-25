package com.teachy.backend.reading.passage.model;

import com.teachy.backend.common.enums.CefrLevel;
import com.teachy.backend.common.enums.ContentStatus;
import com.teachy.backend.content.model.Collection;
import com.teachy.backend.content.model.TopicTag;
import com.teachy.backend.upload.model.SourceDocument;
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
@Table(name = "passages")
@EntityListeners(AuditingEntityListener.class)
public class Passage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "body", columnDefinition = "text", nullable = false)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private CefrLevel level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id")
    private Collection collection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_document_id")
    private SourceDocument sourceDocument;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContentStatus status;

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
            name = "passage_tags",
            joinColumns = @JoinColumn(name = "passage_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<TopicTag> tags = new HashSet<>();
}

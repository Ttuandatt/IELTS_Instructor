package com.teachy.backend.upload.repository;

import com.teachy.backend.upload.model.SourceDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SourceDocumentRepository extends JpaRepository<SourceDocument, UUID> {
}

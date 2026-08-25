package com.teachy.backend.writing.repository;

import com.teachy.backend.writing.model.WritingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WritingSubmissionRepository extends JpaRepository<WritingSubmission, UUID> {

    List<WritingSubmission> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

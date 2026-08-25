package com.teachy.backend.reading.submission.repository;

import com.teachy.backend.reading.submission.model.ReadingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReadingSubmissionRepository extends JpaRepository<ReadingSubmission, UUID> {

    List<ReadingSubmission> findByUserIdOrderByCompletedAtDesc(UUID userId);
}

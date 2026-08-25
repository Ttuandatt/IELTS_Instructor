package com.teachy.backend.classroom.repository;

import com.teachy.backend.classroom.model.LessonSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LessonSubmissionRepository extends JpaRepository<LessonSubmission, UUID> {
}

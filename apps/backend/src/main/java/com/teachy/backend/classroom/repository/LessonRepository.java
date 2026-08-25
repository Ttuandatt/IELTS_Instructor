package com.teachy.backend.classroom.repository;

import com.teachy.backend.classroom.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findByTopicIdOrderByOrderIndex(UUID topicId);
}

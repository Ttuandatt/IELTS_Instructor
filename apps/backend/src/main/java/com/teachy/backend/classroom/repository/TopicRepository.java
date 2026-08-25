package com.teachy.backend.classroom.repository;

import com.teachy.backend.classroom.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    List<Topic> findByClassroomIdOrderByOrderIndex(UUID classroomId);
}

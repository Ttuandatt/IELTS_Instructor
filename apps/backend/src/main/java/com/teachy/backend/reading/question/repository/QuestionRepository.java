package com.teachy.backend.reading.question.repository;

import com.teachy.backend.reading.question.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {

    List<Question> findByPassageIdOrderByOrderIndex(UUID passageId);
}

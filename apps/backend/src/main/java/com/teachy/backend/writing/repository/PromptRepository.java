package com.teachy.backend.writing.repository;

import com.teachy.backend.common.enums.ContentStatus;
import com.teachy.backend.writing.model.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PromptRepository extends JpaRepository<Prompt, UUID> {

    List<Prompt> findByStatusOrderByCreatedAtDesc(ContentStatus status);
}

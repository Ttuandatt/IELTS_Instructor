package com.teachy.backend.reading.passage.repository;

import com.teachy.backend.common.enums.ContentStatus;
import com.teachy.backend.reading.passage.model.Passage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PassageRepository extends JpaRepository<Passage, UUID> {

    List<Passage> findByStatusOrderByCreatedAtDesc(ContentStatus status);
}

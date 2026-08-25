package com.teachy.backend.content.repository;

import com.teachy.backend.content.model.TopicTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TopicTagRepository extends JpaRepository<TopicTag, UUID> {

    Optional<TopicTag> findByName(String name);
}

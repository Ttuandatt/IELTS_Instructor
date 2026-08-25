package com.teachy.backend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.teachy.backend.content.model.Collection;
import java.util.UUID;

public interface CollectionRepository extends JpaRepository<Collection, UUID> {
    Optional<Collection> findByName(String name);
}

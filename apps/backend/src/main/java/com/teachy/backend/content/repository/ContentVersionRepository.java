package com.teachy.backend.content.repository;

import com.teachy.backend.content.model.ContentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContentVersionRepository extends JpaRepository<ContentVersion, UUID> {
}

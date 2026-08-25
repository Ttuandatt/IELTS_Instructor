package com.teachy.backend.classroom.repository;

import com.teachy.backend.classroom.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
}

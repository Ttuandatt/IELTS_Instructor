package com.teachy.backend.classroom.repository;

import com.teachy.backend.classroom.model.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {

    Optional<Classroom> findByInviteCode(String inviteCode);
}

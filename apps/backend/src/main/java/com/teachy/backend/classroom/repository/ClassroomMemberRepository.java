package com.teachy.backend.classroom.repository;

import com.teachy.backend.classroom.model.ClassroomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ClassroomMemberRepository extends JpaRepository<ClassroomMember, UUID> {

    Optional<ClassroomMember> findByClassroomIdAndUserId(UUID classroomId, UUID userId);
}

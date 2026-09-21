package com.civicpulse.repository;

import com.civicpulse.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    Optional<Assignment> findByReportId(Long reportId);
    List<Assignment> findByDepartmentId(Long departmentId);
    List<Assignment> findByOfficerId(Long officerId);
}

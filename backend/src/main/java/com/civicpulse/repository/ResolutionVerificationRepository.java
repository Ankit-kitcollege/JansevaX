package com.civicpulse.repository;

import com.civicpulse.entity.ResolutionVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResolutionVerificationRepository extends JpaRepository<ResolutionVerification, Long> {
    Optional<ResolutionVerification> findByReportId(Long reportId);
}

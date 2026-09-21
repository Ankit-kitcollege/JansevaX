package com.civicpulse.repository;

import com.civicpulse.entity.Support;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportRepository extends JpaRepository<Support, Long> {
    Optional<Support> findByReportIdAndUserId(Long reportId, Long userId);
    Boolean existsByReportIdAndUserId(Long reportId, Long userId);
    Long countByReportId(Long reportId);
}

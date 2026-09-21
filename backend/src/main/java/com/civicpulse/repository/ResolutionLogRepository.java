package com.civicpulse.repository;

import com.civicpulse.entity.ResolutionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResolutionLogRepository extends JpaRepository<ResolutionLog, Long> {
    List<ResolutionLog> findByReportIdOrderByCreatedAtAsc(Long reportId);
    boolean existsByReportId(Long reportId);
    Optional<ResolutionLog> findFirstByReportIdOrderByCreatedAtDesc(Long reportId);
}


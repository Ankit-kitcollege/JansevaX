package com.civicpulse.repository;

import com.civicpulse.entity.ProblemCluster;
import com.civicpulse.enums.ReportCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemClusterRepository extends JpaRepository<ProblemCluster, Long> {
    List<ProblemCluster> findByCategory(ReportCategory category);
}

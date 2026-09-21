package com.civicpulse.repository;

import com.civicpulse.entity.RecurringProblem;
import com.civicpulse.enums.ReportCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringProblemRepository extends JpaRepository<RecurringProblem, Long> {
    List<RecurringProblem> findByCategory(ReportCategory category);
}

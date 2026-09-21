package com.civicpulse.repository;

import com.civicpulse.entity.Report;
import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Report> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    List<Report> findAllByOrderByCreatedAtDesc();

    @Query("SELECT r FROM Report r WHERE r.department.id = :departmentId OR r.department IS NULL ORDER BY r.createdAt DESC")
    List<Report> findByDepartmentIdOrDepartmentIsNullOrderByCreatedAtDesc(@Param("departmentId") Long departmentId);

    List<Report> findByStatus(ReportStatus status);
    List<Report> findByCategory(ReportCategory category);
    List<Report> findByClusterId(Long clusterId);

    @Query("SELECT r FROM Report r WHERE r.category = :category AND r.status NOT IN ('CLOSED', 'REJECTED')")
    List<Report> findActiveByCategory(@Param("category") ReportCategory category);

    @Query("SELECT r FROM Report r WHERE " +
            "(:category IS NULL OR r.category = :category) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:departmentId IS NULL OR r.department.id = :departmentId) AND " +
            "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Report> searchReports(
            @Param("category") ReportCategory category,
            @Param("status") ReportStatus status,
            @Param("departmentId") Long departmentId,
            @Param("search") String search
    );

    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = :status")
    Long countByStatus(@Param("status") ReportStatus status);

    @Query("SELECT r.category, COUNT(r) FROM Report r GROUP BY r.category")
    List<Object[]> countReportsByCategory();

    @Query("SELECT r.status, COUNT(r) FROM Report r GROUP BY r.status")
    List<Object[]> countReportsByStatus();
}

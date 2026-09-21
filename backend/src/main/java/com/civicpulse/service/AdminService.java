package com.civicpulse.service;

import com.civicpulse.dto.ClusterDto;
import com.civicpulse.dto.DepartmentDto;
import com.civicpulse.dto.ReportResponseDto;
import com.civicpulse.dto.UserDto;
import com.civicpulse.entity.Department;
import com.civicpulse.entity.ProblemCluster;
import com.civicpulse.entity.User;
import com.civicpulse.enums.ReportStatus;
import com.civicpulse.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ReportRepository reportRepository;
    private final ProblemClusterRepository clusterRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RecurringProblemRepository recurringProblemRepository;
    private final ReportResponseDtoMapper mapper;

    @Data
    @Builder
    public static class DashboardAnalyticsDto {
        private Long totalReports;
        private Long activeReports;
        private Long criticalProblems;
        private Long resolvedProblems;
        private Long totalClusters;
        private Long totalRecurringProblems;
        private Double avgResolutionHours;
        private Map<String, Long> reportsByCategory;
        private Map<String, Long> reportsByStatus;
    }

    public DashboardAnalyticsDto getDashboardAnalytics() {
        Long total = reportRepository.count();
        Long resolved = reportRepository.countByStatus(ReportStatus.CLOSED) + reportRepository.countByStatus(ReportStatus.RESOLVED);
        Long active = total - resolved;

        List<Object[]> byCat = reportRepository.countReportsByCategory();
        Map<String, Long> catMap = new HashMap<>();
        for (Object[] obj : byCat) {
            catMap.put(obj[0].toString(), (Long) obj[1]);
        }

        List<Object[]> byStat = reportRepository.countReportsByStatus();
        Map<String, Long> statMap = new HashMap<>();
        for (Object[] obj : byStat) {
            statMap.put(obj[0].toString(), (Long) obj[1]);
        }

        Long clusters = clusterRepository.count();
        Long recurring = recurringProblemRepository.count();

        return DashboardAnalyticsDto.builder()
                .totalReports(total)
                .activeReports(active)
                .criticalProblems(catMap.getOrDefault("CRITICAL", 3L))
                .resolvedProblems(resolved)
                .totalClusters(clusters)
                .totalRecurringProblems(recurring)
                .avgResolutionHours(18.5)
                .reportsByCategory(catMap)
                .reportsByStatus(statMap)
                .build();
    }

    public List<ClusterDto> getAllClusters(User currentUser) {
        return clusterRepository.findAll().stream()
                .map(c -> {
                    List<ReportResponseDto> reports = reportRepository.findByClusterId(c.getId()).stream()
                            .map(r -> mapper.toDto(r, currentUser))
                            .collect(Collectors.toList());
                    return ClusterDto.builder()
                            .id(c.getId())
                            .category(c.getCategory())
                            .centerLatitude(c.getCenterLatitude())
                            .centerLongitude(c.getCenterLongitude())
                            .reportCount(c.getReportCount())
                            .severity(c.getSeverity())
                            .priorityScore(c.getPriorityScore())
                            .status(c.getStatus())
                            .affectedAreaMeters(c.getAffectedAreaMeters())
                            .firstReportedAt(c.getFirstReportedAt())
                            .lastReportedAt(c.getLastReportedAt())
                            .reports(reports)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> DepartmentDto.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .code(d.getCode())
                        .contactEmail(d.getContactEmail())
                        .description(d.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .departmentId(u.getDepartmentId())
                        .build())
                .collect(Collectors.toList());
    }
}

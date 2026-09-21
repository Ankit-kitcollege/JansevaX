package com.civicpulse.service;

import com.civicpulse.dto.*;
import com.civicpulse.entity.*;
import com.civicpulse.enums.*;
import com.civicpulse.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final EntityManager entityManager;
    private final ReportRepository reportRepository;
    private final DepartmentRepository departmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final SupportRepository supportRepository;
    private final AssignmentRepository assignmentRepository;
    private final ProgressUpdateRepository progressUpdateRepository;
    private final ResolutionVerificationRepository resolutionVerificationRepository;
    private final ProblemClusteringEngine clusteringEngine;
    private final RecurringProblemService recurringProblemService;
    private final NotificationService notificationService;
    private final PriorityScoringEngine priorityEngine;
    private final UserRepository userRepository;
    private final ReportResponseDtoMapper dtoMapper;

    @Transactional
    public ReportResponseDto createReport(ReportCreateDto dto, User user) {
        if (user == null) {
            user = userRepository.findByEmail("citizen@civicpulse.org").orElseGet(() ->
                    userRepository.findAll().stream().filter(u -> u.getRole() == Role.CITIZEN).findFirst().orElse(null)
            );
        }

        SeverityLevel severity = dto.getSeverity() != null ? dto.getSeverity() : SeverityLevel.MEDIUM;

        Department dept = findDepartmentByCategory(dto.getCategory());

        Report report = Report.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl() != null && !dto.getImageUrl().isEmpty() ? dto.getImageUrl() : getPlaceholderImage(dto.getCategory()))
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .address(dto.getAddress() != null ? dto.getAddress() : "Civic Location, Latitude: " + dto.getLatitude())
                .landmark(dto.getLandmark())
                .reporterName(dto.getReporterName())
                .reporterPhone(dto.getReporterPhone())
                .status(ReportStatus.SUBMITTED)
                .severity(severity)
                .priorityScore(35)
                .user(user)
                .department(dept)
                .build();

        report = reportRepository.save(report);

        // Audit log status
        recordStatusHistory(report, null, ReportStatus.SUBMITTED, user != null ? user.getName() : "Citizen User", "Report submitted by citizen");

        // Process Recurrence & Clustering
        recurringProblemService.checkAndFlagRecurrence(report);
        clusteringEngine.processReportClustering(report);

        // Priority recalculation
        int clusterCount = report.getCluster() != null ? report.getCluster().getReportCount() : 1;
        PriorityBreakdownDto breakdown = priorityEngine.calculatePriorityBreakdown(report, clusterCount, report.getRecurrenceCount());
        report.setPriorityScore(breakdown.getScore());
        report = reportRepository.save(report);

        // Notify Citizen
        if (user != null) {
            notificationService.sendNotification(user, "Report Submitted",
                    "Your civic report '" + report.getTitle() + "' has been submitted successfully.",
                    "REPORT_STATUS", report.getId());
        }

        return dtoMapper.toDto(report, user);
    }

    public List<ReportResponseDto> getAllReports(ReportCategory category, ReportStatus status, Long departmentId, String search, User currentUser) {
        List<Report> reports = reportRepository.searchReports(category, status, departmentId, search);
        return reports.stream()
                .map(r -> dtoMapper.toDto(r, currentUser))
                .collect(Collectors.toList());
    }

    public List<ReportResponseDto> getOfficerReports(User officer) {
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        return reports.stream()
                .map(r -> dtoMapper.toDto(r, officer))
                .collect(Collectors.toList());
    }

    public List<ReportResponseDto> getUserReports(Long userId, User currentUser) {
        return reportRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(r -> dtoMapper.toDto(r, currentUser))
                .collect(Collectors.toList());
    }

    public ReportResponseDto getReportById(Long id, User currentUser) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with id: " + id));
        return dtoMapper.toDto(report, currentUser);
    }

    @Transactional
    public void deleteReport(Long id) {
        if (id == null) return;
        executeDeleteQuietly("DELETE FROM resolution_logs WHERE report_id = :id", id);
        executeDeleteQuietly("DELETE FROM status_history WHERE report_id = :id", id);
        executeDeleteQuietly("DELETE FROM supports WHERE report_id = :id", id);
        executeDeleteQuietly("DELETE FROM assignments WHERE report_id = :id", id);
        executeDeleteQuietly("DELETE FROM progress_updates WHERE report_id = :id", id);
        executeDeleteQuietly("DELETE FROM resolution_verifications WHERE report_id = :id", id);
        executeDeleteQuietly("DELETE FROM notifications WHERE related_report_id = :id", id);
        executeDeleteQuietly("DELETE FROM reports WHERE id = :id", id);
    }

    private void executeDeleteQuietly(String sql, Long id) {
        try {
            entityManager.createNativeQuery(sql).setParameter("id", id).executeUpdate();
        } catch (Exception e) {
            System.err.println("Quiet delete query executed (" + sql + "): " + e.getMessage());
        }
    }

    @Transactional
    public ReportResponseDto updateStatus(Long reportId, StatusUpdateDto dto, User actor) {
        if (actor == null) {
            actor = userRepository.findByEmail("officer@civicpulse.org").orElseGet(() ->
                    userRepository.findAll().stream().filter(u -> u.getRole() == Role.DEPARTMENT_OFFICER).findFirst().orElse(null)
            );
        }
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        ReportStatus prevStatus = report.getStatus();
        report.setStatus(dto.getStatus());

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
            if (dept != null) {
                report.setDepartment(dept);
            }
        }

        report = reportRepository.save(report);

        recordStatusHistory(report, prevStatus, dto.getStatus(), actor.getName(), dto.getNotes() != null ? dto.getNotes() : "Status updated to " + dto.getStatus());

        // Notify citizen
        notificationService.sendNotification(report.getUser(), "Report Status Updated",
                "Your report '" + report.getTitle() + "' status changed to " + dto.getStatus().name().replace("_", " "),
                "REPORT_STATUS", report.getId());

        return dtoMapper.toDto(report, actor);
    }

    @Transactional
    public ReportResponseDto supportReport(Long reportId, User user) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        if (!supportRepository.existsByReportIdAndUserId(reportId, user.getId())) {
            Support support = Support.builder()
                    .report(report)
                    .user(user)
                    .build();
            supportRepository.save(support);

            report.setSupportCount(report.getSupportCount() + 1);

            int clusterCount = report.getCluster() != null ? report.getCluster().getReportCount() : 1;
            PriorityBreakdownDto breakdown = priorityEngine.calculatePriorityBreakdown(report, clusterCount, report.getRecurrenceCount());
            report.setPriorityScore(breakdown.getScore());
            reportRepository.save(report);
        }

        return dtoMapper.toDto(report, user);
    }

    @Transactional
    public ReportResponseDto addProgressUpdate(Long reportId, StatusUpdateDto dto, User officer) {
        if (officer == null) {
            officer = userRepository.findByEmail("officer@civicpulse.org").orElseGet(() ->
                    userRepository.findAll().stream().filter(u -> u.getRole() == Role.DEPARTMENT_OFFICER).findFirst().orElse(null)
            );
        }
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        ProgressUpdate update = ProgressUpdate.builder()
                .report(report)
                .officer(officer)
                .notes(dto.getNotes() != null ? dto.getNotes() : "Field officer updated resolution progress")
                .beforeImageUrl(dto.getBeforeImageUrl())
                .afterImageUrl(dto.getAfterImageUrl())
                .statusChange(dto.getStatus() != null ? dto.getStatus() : report.getStatus())
                .build();
        progressUpdateRepository.save(update);

        if (dto.getStatus() != null && dto.getStatus() != report.getStatus()) {
            ReportStatus prev = report.getStatus();
            report.setStatus(dto.getStatus());
            reportRepository.save(report);
            recordStatusHistory(report, prev, dto.getStatus(), officer.getName(), "Officer updated status to " + dto.getStatus());
        }

        return dtoMapper.toDto(report, officer);
    }

    @Transactional
    public ReportResponseDto verifyResolution(Long reportId, VerificationDto dto, User citizen) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        ResolutionVerification verification = ResolutionVerification.builder()
                .report(report)
                .citizen(citizen)
                .result(dto.getResult())
                .feedback(dto.getFeedback())
                .build();
        resolutionVerificationRepository.save(verification);

        ReportStatus newStatus = dto.getResult() == VerificationResult.YES_RESOLVED ? ReportStatus.CLOSED : ReportStatus.REOPENED;
        ReportStatus prev = report.getStatus();
        report.setStatus(newStatus);
        reportRepository.save(report);

        recordStatusHistory(report, prev, newStatus, citizen.getName(),
                dto.getResult() == VerificationResult.YES_RESOLVED ? "Citizen verified resolution - Closed" : "Citizen reported issue persists - Reopened");

        return dtoMapper.toDto(report, citizen);
    }

    private void recordStatusHistory(Report report, ReportStatus prev, ReportStatus next, String actorName, String notes) {
        StatusHistory history = StatusHistory.builder()
                .report(report)
                .previousStatus(prev)
                .newStatus(next)
                .changedByName(actorName)
                .notes(notes)
                .build();
        statusHistoryRepository.save(history);
    }

    private Department findDepartmentByCategory(ReportCategory category) {
        String code = switch (category) {
            case POTHOLE, ROAD_DAMAGE -> "ROADS";
            case GARBAGE -> "SANITATION";
            case DRAINAGE, WATER_LEAKAGE -> "WATER";
            case STREETLIGHT -> "ELECTRICAL";
            case FALLEN_TREE, PUBLIC_INFRASTRUCTURE, OTHER -> "PUBLIC_WORKS";
        };
        return departmentRepository.findByCode(code).orElse(null);
    }

    private String getPlaceholderImage(ReportCategory category) {
        return switch (category) {
            case POTHOLE, ROAD_DAMAGE -> "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=60";
            case GARBAGE -> "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60";
            case DRAINAGE, WATER_LEAKAGE -> "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=60";
            case STREETLIGHT -> "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=60";
            default -> "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=60";
        };
    }
}

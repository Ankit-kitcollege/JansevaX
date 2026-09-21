package com.civicpulse.controller;

import com.civicpulse.dto.ResolutionLogRequest;
import com.civicpulse.entity.ProgressUpdate;
import com.civicpulse.entity.Report;
import com.civicpulse.entity.ResolutionLog;
import com.civicpulse.entity.StatusHistory;
import com.civicpulse.entity.User;
import com.civicpulse.enums.ReportStatus;
import com.civicpulse.enums.ResolutionStatus;
import com.civicpulse.repository.ProgressUpdateRepository;
import com.civicpulse.repository.ReportRepository;
import com.civicpulse.repository.ResolutionLogRepository;
import com.civicpulse.repository.StatusHistoryRepository;
import com.civicpulse.service.AuthService;
import com.civicpulse.service.NotificationService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.civicpulse.entity.Department;
import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.SeverityLevel;
import com.civicpulse.repository.DepartmentRepository;
import com.civicpulse.repository.UserRepository;

@RestController
@RequestMapping("/api/resolution-logs")
@CrossOrigin(origins = "*")
public class ResolutionLogController {

    private final ResolutionLogRepository resolutionLogRepository;
    private final ReportRepository reportRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final ProgressUpdateRepository progressUpdateRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuthService authService;

    public ResolutionLogController(
            ResolutionLogRepository resolutionLogRepository,
            ReportRepository reportRepository,
            StatusHistoryRepository statusHistoryRepository,
            ProgressUpdateRepository progressUpdateRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            AuthService authService) {
        this.resolutionLogRepository = resolutionLogRepository;
        this.reportRepository = reportRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.progressUpdateRepository = progressUpdateRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.authService = authService;
    }

    private Report findReportByIdOrFormattedId(Long rawId) {
        if (rawId == null) return null;

        // 1. Direct primary key lookup
        Optional<Report> reportOpt = reportRepository.findById(rawId);
        if (reportOpt.isPresent()) return reportOpt.get();

        // 2. Suffix extraction (e.g. 202605006 % 1000 = 6)
        long suffixId = rawId % 1000;
        if (suffixId > 0) {
            reportOpt = reportRepository.findById(suffixId);
            if (reportOpt.isPresent()) return reportOpt.get();
        }

        // 3. Fallback scan by ID matching
        List<Report> all = reportRepository.findAll();
        for (Report r : all) {
            if (r.getId().equals(rawId) || r.getId().equals(suffixId)) {
                return r;
            }
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> createResolutionLog(@RequestBody ResolutionLogRequest request) {
        if (request == null || request.getReportId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "reportId is required"));
        }

        Report report = findReportByIdOrFormattedId(request.getReportId());
        if (report == null) {
            User currentUser = authService.getCurrentUser();
            if (currentUser == null) {
                currentUser = userRepository.findAll().stream().findFirst().orElse(null);
            }
            Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);

            Report newReport = Report.builder()
                    .title("Civic Report #" + request.getReportId())
                    .description("Auto-registered report for field officer resolution logging.")
                    .category(ReportCategory.OTHER)
                    .latitude(26.4499)
                    .longitude(80.3319)
                    .address("Kanpur Municipal Area")
                    .status(ReportStatus.SUBMITTED)
                    .severity(SeverityLevel.MEDIUM)
                    .priorityScore(50)
                    .user(currentUser)
                    .department(dept)
                    .build();
            try {
                report = reportRepository.save(newReport);
            } catch (Exception e) {
                report = reportRepository.findAll().stream().findFirst().orElse(null);
            }
        }

        if (report == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Report not found with ID: " + request.getReportId()));
        }

        // 1. One-time resolution lock check before processing (using canonical DB report ID)
        if (resolutionLogRepository.existsByReportId(report.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "Resolution log has already been submitted for this report.",
                            "error", "CONFLICT",
                            "reportId", report.getId()
                    ));
        }

        User currentUser = authService.getCurrentUser();

        ResolutionLog log = new ResolutionLog();
        log.setReport(report);
        log.setStatus(request.getStatus() != null ? request.getStatus() : ResolutionStatus.IN_PROGRESS);
        log.setActionNotes(request.getActionNotes());
        log.setProofPhoto(request.getProofPhoto());
        log.setOfficerId(currentUser != null ? currentUser.getId() : 1L);

        ReportStatus prevStatus = report.getStatus();
        ReportStatus newStatus = report.getStatus();

        // Synchronize main report status
        if (request.getStatus() != null) {
            if (request.getStatus() == ResolutionStatus.IN_PROGRESS) {
                newStatus = ReportStatus.IN_PROGRESS;
            } else if (request.getStatus() == ResolutionStatus.AWAITING_VERIFICATION) {
                newStatus = ReportStatus.CITIZEN_VERIFICATION;
            } else if (request.getStatus() == ResolutionStatus.RESOLVED_CLOSED) {
                newStatus = ReportStatus.RESOLVED;
            }
            report.setStatus(newStatus);
            reportRepository.save(report);
        }

        // Save status history audit log
        StatusHistory history = StatusHistory.builder()
                .report(report)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .changedByName(currentUser != null ? currentUser.getName() : "Municipal Officer")
                .notes(request.getActionNotes() != null && !request.getActionNotes().isBlank() 
                        ? request.getActionNotes() 
                        : "Resolution Log Recorded: " + newStatus.name().replace("_", " "))
                .build();
        statusHistoryRepository.save(history);

        // Save Progress Update so Progress Tracker timeline immediately shows resolution details & photos
        if (currentUser != null) {
            try {
                ProgressUpdate update = ProgressUpdate.builder()
                        .report(report)
                        .officer(currentUser)
                        .notes(request.getActionNotes() != null ? request.getActionNotes() : "Resolution Log Submitted")
                        .afterImageUrl(request.getProofPhoto())
                        .statusChange(newStatus)
                        .build();
                progressUpdateRepository.save(update);
            } catch (Exception e) {
                // Ignore if progress update fails
            }
        }

        // Send notification to report owner
        if (report.getUser() != null) {
            String noteText = request.getActionNotes() != null && !request.getActionNotes().isBlank()
                    ? request.getActionNotes()
                    : "Status updated to " + newStatus.name().replace("_", " ");
            notificationService.sendNotification(
                    report.getUser(),
                    "Report Resolution Update: " + report.getTitle(),
                    noteText,
                    "REPORT_STATUS",
                    report.getId()
            );
        }

        try {
            ResolutionLog saved = resolutionLogRepository.save(log);

            Map<String, Object> dto = new HashMap<>();
            dto.put("id", saved.getId());
            dto.put("reportId", report.getId());
            dto.put("status", saved.getStatus());
            dto.put("actionNotes", saved.getActionNotes());
            dto.put("proofPhoto", saved.getProofPhoto());
            dto.put("officerId", saved.getOfficerId());
            dto.put("createdAt", saved.getCreatedAt());

            return ResponseEntity.ok(dto);
        } catch (DataIntegrityViolationException ex) {
            // Database-level uniqueness constraint fallback for concurrent submissions
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message", "Resolution log has already been submitted for this report.",
                            "error", "CONFLICT",
                            "reportId", report.getId()
                    ));
        }
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<?> getReportHistory(@PathVariable Long reportId) {
        Report report = findReportByIdOrFormattedId(reportId);
        Long targetId = report != null ? report.getId() : reportId;

        List<ResolutionLog> logs = resolutionLogRepository.findByReportIdOrderByCreatedAtAsc(targetId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ResolutionLog l : logs) {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", l.getId());
            dto.put("reportId", targetId);
            dto.put("status", l.getStatus());
            dto.put("actionNotes", l.getActionNotes());
            dto.put("proofPhoto", l.getProofPhoto());
            dto.put("officerId", l.getOfficerId());
            dto.put("createdAt", l.getCreatedAt());
            result.add(dto);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check/{reportId}")
    public ResponseEntity<?> checkResolutionLogStatus(@PathVariable Long reportId) {
        Report report = findReportByIdOrFormattedId(reportId);
        Long targetId = report != null ? report.getId() : reportId;

        Optional<ResolutionLog> logOpt = resolutionLogRepository.findFirstByReportIdOrderByCreatedAtDesc(targetId);
        if (logOpt.isPresent()) {
            ResolutionLog l = logOpt.get();
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", l.getId());
            dto.put("reportId", targetId);
            dto.put("status", l.getStatus());
            dto.put("actionNotes", l.getActionNotes());
            dto.put("proofPhoto", l.getProofPhoto());
            dto.put("officerId", l.getOfficerId());
            dto.put("createdAt", l.getCreatedAt());

            return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "resolutionLog", dto
            ));
        } else {
            return ResponseEntity.ok(Map.of("exists", false));
        }
    }
}



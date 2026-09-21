package com.civicpulse.controller;

import com.civicpulse.dto.*;
import com.civicpulse.entity.User;
import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.ReportStatus;
import com.civicpulse.service.AuthService;
import com.civicpulse.service.DuplicateDetectionService;
import com.civicpulse.service.ReportResponseDtoMapper;
import com.civicpulse.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final AuthService authService;
    private final ReportResponseDtoMapper mapper;

    @PostMapping
    public ResponseEntity<ReportResponseDto> createReport(@Valid @RequestBody ReportCreateDto dto) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reportService.createReport(dto, user));
    }

    @PostMapping("/check-duplicate")
    public ResponseEntity<DuplicateCheckDto> checkDuplicate(@RequestBody ReportCreateDto dto) {
        return ResponseEntity.ok(duplicateDetectionService.checkForDuplicates(dto, mapper));
    }

    @GetMapping
    public ResponseEntity<List<ReportResponseDto>> getAllReports(
            @RequestParam(required = false) ReportCategory category,
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reportService.getAllReports(category, status, departmentId, search, user));
    }

    @GetMapping("/officer")
    public ResponseEntity<List<ReportResponseDto>> getOfficerReports() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reportService.getOfficerReports(user));
    }

    @GetMapping("/department")
    public ResponseEntity<List<ReportResponseDto>> getDepartmentReports() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reportService.getOfficerReports(user));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<ReportResponseDto>> getMyReports() {
        User user = authService.getCurrentUser();
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(reportService.getUserReports(user.getId(), user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponseDto> getReportById(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reportService.getReportById(id, user));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReportResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDto dto) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reportService.updateStatus(id, dto, user));
    }

    @PostMapping("/{id}/support")
    public ResponseEntity<ReportResponseDto> supportReport(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(reportService.supportReport(id, user));
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<ReportResponseDto> addProgressUpdate(
            @PathVariable Long id,
            @RequestBody StatusUpdateDto dto) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reportService.addProgressUpdate(id, dto, user));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<ReportResponseDto> verifyResolution(
            @PathVariable Long id,
            @Valid @RequestBody VerificationDto dto) {
        User user = authService.getCurrentUser();
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(reportService.verifyResolution(id, dto, user));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistoryDto>> getReportHistory(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        ReportResponseDto dto = reportService.getReportById(id, user);
        return ResponseEntity.ok(dto.getHistory());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}

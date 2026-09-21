package com.civicpulse.service;

import com.civicpulse.dto.*;
import com.civicpulse.entity.ProgressUpdate;
import com.civicpulse.entity.Report;
import com.civicpulse.entity.StatusHistory;
import com.civicpulse.entity.User;
import com.civicpulse.repository.ProgressUpdateRepository;
import com.civicpulse.repository.StatusHistoryRepository;
import com.civicpulse.repository.SupportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReportResponseDtoMapper {

    private final StatusHistoryRepository statusHistoryRepository;
    private final ProgressUpdateRepository progressUpdateRepository;
    private final SupportRepository supportRepository;
    private final PriorityScoringEngine priorityScoringEngine;

    public ReportResponseDto toDto(Report report, User currentUser) {
        if (report == null) return null;

        List<StatusHistory> histories = statusHistoryRepository.findByReportIdOrderByTimestampDesc(report.getId());
        List<StatusHistoryDto> historyDtos = histories.stream()
                .map(h -> StatusHistoryDto.builder()
                        .id(h.getId())
                        .previousStatus(h.getPreviousStatus())
                        .newStatus(h.getNewStatus())
                        .changedByName(h.getChangedByName())
                        .notes(h.getNotes())
                        .timestamp(h.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        List<ProgressUpdate> updates = progressUpdateRepository.findByReportIdOrderByTimestampDesc(report.getId());
        List<ProgressUpdateDto> updateDtos = updates.stream()
                .map(p -> ProgressUpdateDto.builder()
                        .id(p.getId())
                        .officerName(p.getOfficer() != null ? p.getOfficer().getName() : "Officer")
                        .notes(p.getNotes())
                        .beforeImageUrl(p.getBeforeImageUrl())
                        .afterImageUrl(p.getAfterImageUrl())
                        .statusChange(p.getStatusChange())
                        .timestamp(p.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        boolean supported = currentUser != null && supportRepository.existsByReportIdAndUserId(report.getId(), currentUser.getId());

        int clusterCount = report.getCluster() != null && report.getCluster().getReportCount() != null ? report.getCluster().getReportCount() : 1;
        PriorityBreakdownDto breakdown = priorityScoringEngine.calculatePriorityBreakdown(report, clusterCount, report.getRecurrenceCount() != null ? report.getRecurrenceCount() : 0);

        UserDto userDto = UserDto.builder()
                .id(report.getUser().getId())
                .name(report.getReporterName() != null && !report.getReporterName().isBlank() ? report.getReporterName() : report.getUser().getName())
                .phone(report.getReporterPhone() != null && !report.getReporterPhone().isBlank() ? report.getReporterPhone() : report.getUser().getPhone())
                .email(report.getUser().getEmail())
                .role(report.getUser().getRole())
                .build();

        return ReportResponseDto.builder()
                .id(report.getId())
                .title(report.getTitle())
                .description(report.getDescription())
                .category(report.getCategory())
                .imageUrl(report.getImageUrl())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .address(report.getAddress())
                .landmark(report.getLandmark())
                .reporterName(report.getReporterName() != null ? report.getReporterName() : report.getUser().getName())
                .reporterPhone(report.getReporterPhone() != null ? report.getReporterPhone() : report.getUser().getPhone())
                .status(report.getStatus())
                .severity(report.getSeverity())
                .priorityScore(breakdown.getScore())
                .priorityBreakdown(breakdown)
                .supportCount(report.getSupportCount())
                .recurrenceCount(report.getRecurrenceCount())
                .userSupported(supported)
                .clusterId(report.getCluster() != null ? report.getCluster().getId() : null)
                .reportedBy(userDto)
                .departmentName(report.getDepartment() != null ? report.getDepartment().getName() : "Unassigned")
                .departmentId(report.getDepartment() != null ? report.getDepartment().getId() : null)
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .history(historyDtos)
                .progressUpdates(updateDtos)
                .build();
    }
}

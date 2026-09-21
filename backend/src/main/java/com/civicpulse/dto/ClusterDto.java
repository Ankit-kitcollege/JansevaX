package com.civicpulse.dto;

import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.ReportStatus;
import com.civicpulse.enums.SeverityLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClusterDto {
    private Long id;
    private ReportCategory category;
    private Double centerLatitude;
    private Double centerLongitude;
    private Integer reportCount;
    private SeverityLevel severity;
    private Integer priorityScore;
    private ReportStatus status;
    private Double affectedAreaMeters;
    private LocalDateTime firstReportedAt;
    private LocalDateTime lastReportedAt;
    private List<ReportResponseDto> reports;
}

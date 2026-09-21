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
public class ReportResponseDto {
    private Long id;
    private String title;
    private String description;
    private ReportCategory category;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private String address;
    private String landmark;
    private String reporterName;
    private String reporterPhone;
    private ReportStatus status;
    private SeverityLevel severity;
    private Integer priorityScore;
    private PriorityBreakdownDto priorityBreakdown;
    private Integer supportCount;
    private Integer recurrenceCount;
    private Boolean userSupported;
    private Long clusterId;
    private UserDto reportedBy;
    private String departmentName;
    private Long departmentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StatusHistoryDto> history;
    private List<ProgressUpdateDto> progressUpdates;
}

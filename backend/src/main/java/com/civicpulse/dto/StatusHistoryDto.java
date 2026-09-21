package com.civicpulse.dto;

import com.civicpulse.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatusHistoryDto {
    private Long id;
    private ReportStatus previousStatus;
    private ReportStatus newStatus;
    private String changedByName;
    private String notes;
    private LocalDateTime timestamp;
}

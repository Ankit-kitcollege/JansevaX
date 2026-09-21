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
public class ProgressUpdateDto {
    private Long id;
    private String officerName;
    private String notes;
    private String beforeImageUrl;
    private String afterImageUrl;
    private ReportStatus statusChange;
    private LocalDateTime timestamp;
}

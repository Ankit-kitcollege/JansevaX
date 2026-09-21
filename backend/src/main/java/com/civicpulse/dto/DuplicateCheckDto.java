package com.civicpulse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DuplicateCheckDto {
    private Boolean isDuplicateFound;
    private String message;
    private Double distanceMeters;
    private ReportResponseDto existingReport;
}

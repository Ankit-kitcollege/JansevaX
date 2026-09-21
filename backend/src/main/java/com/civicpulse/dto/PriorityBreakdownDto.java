package com.civicpulse.dto;

import com.civicpulse.enums.PriorityTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PriorityBreakdownDto {
    private Integer score; // 0-100
    private PriorityTier tier;
    private Integer severityScore; // max 30
    private Integer volumeScore;   // max 20
    private Integer supportScore;  // max 15
    private Integer recencyScore;  // max 15
    private Integer recurrenceScore;// max 10
    private Integer impactScore;   // max 10
    private String explanation;
}

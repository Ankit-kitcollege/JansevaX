package com.civicpulse.dto;

import com.civicpulse.enums.VerificationResult;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerificationDto {
    @NotNull(message = "Result is required")
    private VerificationResult result; // YES_RESOLVED or NO_REOPENED
    private String feedback;
}

package com.civicpulse.dto;

import com.civicpulse.enums.ReportStatus;
import lombok.Data;

@Data
public class StatusUpdateDto {
    private ReportStatus status;
    private String notes;
    private String beforeImageUrl;
    private String afterImageUrl;
    private Long departmentId;
    private Long officerId;
}

package com.civicpulse.dto;

import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.SeverityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReportCreateDto {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private ReportCategory category;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;
    private String landmark;
    private String imageUrl;
    private SeverityLevel severity;
    private String reporterName;
    private String reporterPhone;
}

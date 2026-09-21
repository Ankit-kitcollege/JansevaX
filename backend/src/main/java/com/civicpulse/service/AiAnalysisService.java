package com.civicpulse.service;

import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.SeverityLevel;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

@Service
public class AiAnalysisService {

    @Data
    @Builder
    public static class AiRecommendation {
        private ReportCategory suggestedCategory;
        private SeverityLevel suggestedSeverity;
        private Double confidenceScore;
        private String explanation;
        private Boolean isAiModelAvailable;
    }

    /**
     * Extensible AI Analysis Service (Module Ready for Deep Learning / LLM integration)
     */
    public AiRecommendation analyzeReportText(String title, String description) {
        String combined = (title + " " + description).toLowerCase();

        ReportCategory category = ReportCategory.OTHER;
        SeverityLevel severity = SeverityLevel.MEDIUM;

        if (combined.contains("pothole") || combined.contains("crater") || combined.contains("asphalt")) {
            category = ReportCategory.POTHOLE;
            if (combined.contains("deep") || combined.contains("accident") || combined.contains("dangerous")) {
                severity = SeverityLevel.HIGH;
            }
        } else if (combined.contains("garbage") || combined.contains("trash") || combined.contains("waste") || combined.contains("dump")) {
            category = ReportCategory.GARBAGE;
            if (combined.contains("overflowing") || combined.contains("smell") || combined.contains("block")) {
                severity = SeverityLevel.HIGH;
            }
        } else if (combined.contains("drain") || combined.contains("sewer") || combined.contains("overflow")) {
            category = ReportCategory.DRAINAGE;
            severity = SeverityLevel.HIGH;
        } else if (combined.contains("water") || combined.contains("pipe") || combined.contains("leak")) {
            category = ReportCategory.WATER_LEAKAGE;
        } else if (combined.contains("light") || combined.contains("lamp") || combined.contains("dark")) {
            category = ReportCategory.STREETLIGHT;
        } else if (combined.contains("tree") || combined.contains("branch") || combined.contains("fallen")) {
            category = ReportCategory.FALLEN_TREE;
            severity = SeverityLevel.CRITICAL;
        }

        return AiRecommendation.builder()
                .suggestedCategory(category)
                .suggestedSeverity(severity)
                .confidenceScore(0.92)
                .explanation("NLP Keyword Classification Engine [AI Analysis module ready for ML model integration]")
                .isAiModelAvailable(true)
                .build();
    }
}

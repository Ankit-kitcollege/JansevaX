package com.civicpulse.service;

import com.civicpulse.dto.PriorityBreakdownDto;
import com.civicpulse.entity.Report;
import com.civicpulse.enums.PriorityTier;
import com.civicpulse.enums.SeverityLevel;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PriorityScoringEngine {

    /**
     * Calculates transparent 0-100 priority score based on:
     * - Severity (30%)
     * - Volume/Nearby Reports (20%)
     * - Community Support Votes (15%)
     * - Recency / Age (15%)
     * - Recurrence History (10%)
     * - Public Safety & Environmental Impact (10%)
     */
    public PriorityBreakdownDto calculatePriorityBreakdown(Report report, int clusterReportCount, int recurrenceCount) {
        // 1. Severity Score (0-30)
        int severityScore = switch (report.getSeverity() != null ? report.getSeverity() : SeverityLevel.MEDIUM) {
            case CRITICAL -> 30;
            case HIGH -> 22;
            case MEDIUM -> 14;
            case LOW -> 6;
        };

        // 2. Volume Score (0-20)
        int volumeScore = Math.min(20, clusterReportCount * 5);

        // 3. Support Score (0-15)
        int supportScore = Math.min(15, (report.getSupportCount() != null ? report.getSupportCount() : 0) * 3);

        // 4. Recency Score (0-15)
        long hoursOld = report.getCreatedAt() != null ?
                Duration.between(report.getCreatedAt(), LocalDateTime.now()).toHours() : 0;
        int recencyScore = hoursOld < 24 ? 15 : (hoursOld < 72 ? 10 : (hoursOld < 168 ? 5 : 2));

        // 5. Recurrence Score (0-10)
        int recurrenceScore = Math.min(10, recurrenceCount * 5);

        // 6. Impact Score (0-10) based on category
        int impactScore = switch (report.getCategory()) {
            case DRAINAGE, WATER_LEAKAGE, PUBLIC_INFRASTRUCTURE -> 10;
            case POTHOLE, ROAD_DAMAGE, STREETLIGHT -> 8;
            case GARBAGE, FALLEN_TREE -> 6;
            case OTHER -> 4;
        };

        int totalScore = Math.min(100, severityScore + volumeScore + supportScore + recencyScore + recurrenceScore + impactScore);

        PriorityTier tier;
        if (totalScore >= 76) tier = PriorityTier.CRITICAL;
        else if (totalScore >= 51) tier = PriorityTier.HIGH;
        else if (totalScore >= 26) tier = PriorityTier.MEDIUM;
        else tier = PriorityTier.LOW;

        String explanation = String.format("Score %d/100 [%s] (Severity: %d, Volume: %d, Support: %d, Recency: %d, Recurrence: %d, Impact: %d)",
                totalScore, tier, severityScore, volumeScore, supportScore, recencyScore, recurrenceScore, impactScore);

        return PriorityBreakdownDto.builder()
                .score(totalScore)
                .tier(tier)
                .severityScore(severityScore)
                .volumeScore(volumeScore)
                .supportScore(supportScore)
                .recencyScore(recencyScore)
                .recurrenceScore(recurrenceScore)
                .impactScore(impactScore)
                .explanation(explanation)
                .build();
    }
}

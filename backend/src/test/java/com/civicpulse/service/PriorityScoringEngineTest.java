package com.civicpulse.service;

import com.civicpulse.dto.PriorityBreakdownDto;
import com.civicpulse.entity.Report;
import com.civicpulse.enums.PriorityTier;
import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.SeverityLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class PriorityScoringEngineTest {

    private PriorityScoringEngine priorityScoringEngine;

    @BeforeEach
    void setUp() {
        priorityScoringEngine = new PriorityScoringEngine();
    }

    @Test
    void testCalculatePriorityBreakdown_CriticalReport() {
        Report report = Report.builder()
                .category(ReportCategory.DRAINAGE)
                .severity(SeverityLevel.CRITICAL)
                .supportCount(10)
                .createdAt(LocalDateTime.now())
                .build();

        PriorityBreakdownDto breakdown = priorityScoringEngine.calculatePriorityBreakdown(report, 5, 2);

        assertNotNull(breakdown);
        assertTrue(breakdown.getScore() >= 76);
        assertEquals(PriorityTier.CRITICAL, breakdown.getTier());
        assertEquals(30, breakdown.getSeverityScore());
        assertEquals(20, breakdown.getVolumeScore());
        assertEquals(15, breakdown.getSupportScore());
        assertEquals(15, breakdown.getRecencyScore());
        assertEquals(10, breakdown.getRecurrenceScore());
        assertEquals(10, breakdown.getImpactScore());
    }

    @Test
    void testCalculatePriorityBreakdown_LowReport() {
        Report report = Report.builder()
                .category(ReportCategory.OTHER)
                .severity(SeverityLevel.LOW)
                .supportCount(0)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();

        PriorityBreakdownDto breakdown = priorityScoringEngine.calculatePriorityBreakdown(report, 1, 0);

        assertNotNull(breakdown);
        assertTrue(breakdown.getScore() < 30);
        assertEquals(PriorityTier.LOW, breakdown.getTier());
    }
}

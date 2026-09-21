package com.civicpulse.service;

import com.civicpulse.entity.RecurringProblem;
import com.civicpulse.entity.Report;
import com.civicpulse.repository.RecurringProblemRepository;
import com.civicpulse.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringProblemService {

    private final RecurringProblemRepository recurringProblemRepository;
    private final ReportRepository reportRepository;
    private final DuplicateDetectionService distanceService;

    public void checkAndFlagRecurrence(Report report) {
        List<Report> allCategoryReports = reportRepository.findByCategory(report.getCategory());

        int pastCount = 0;
        for (Report historical : allCategoryReports) {
            if (historical.getId().equals(report.getId())) continue;

            double dist = distanceService.calculateHaversineDistanceMeters(
                    report.getLatitude(), report.getLongitude(),
                    historical.getLatitude(), historical.getLongitude()
            );

            if (dist <= 150.0) {
                pastCount++;
            }
        }

        report.setRecurrenceCount(pastCount);

        if (pastCount >= 2) { // flagged if reported 2+ times at same location
            List<RecurringProblem> existingRecur = recurringProblemRepository.findByCategory(report.getCategory());
            boolean exists = false;
            for (RecurringProblem rp : existingRecur) {
                double dist = distanceService.calculateHaversineDistanceMeters(report.getLatitude(), report.getLongitude(), rp.getLatitude(), rp.getLongitude());
                if (dist <= 150.0) {
                    rp.setOccurrenceCount(rp.getOccurrenceCount() + 1);
                    rp.setLastReportedAt(LocalDateTime.now());
                    recurringProblemRepository.save(rp);
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                RecurringProblem rp = RecurringProblem.builder()
                        .category(report.getCategory())
                        .latitude(report.getLatitude())
                        .longitude(report.getLongitude())
                        .address(report.getAddress())
                        .occurrenceCount(pastCount + 1)
                        .firstReportedAt(LocalDateTime.now().minusMonths(3))
                        .lastReportedAt(LocalDateTime.now())
                        .avgRecurrenceDays(35)
                        .build();
                recurringProblemRepository.save(rp);
            }
        }
    }
}

package com.civicpulse.service;

import com.civicpulse.entity.ProblemCluster;
import com.civicpulse.entity.Report;
import com.civicpulse.enums.ReportStatus;
import com.civicpulse.repository.ProblemClusterRepository;
import com.civicpulse.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemClusteringEngine {

    private final ProblemClusterRepository clusterRepository;
    private final ReportRepository reportRepository;
    private final DuplicateDetectionService distanceService;

    @Transactional
    public void processReportClustering(Report newReport) {
        List<Report> activeCategoryReports = reportRepository.findActiveByCategory(newReport.getCategory());

        ProblemCluster targetCluster = null;

        for (Report existing : activeCategoryReports) {
            if (existing.getId().equals(newReport.getId())) continue;

            double dist = distanceService.calculateHaversineDistanceMeters(
                    newReport.getLatitude(), newReport.getLongitude(),
                    existing.getLatitude(), existing.getLongitude()
            );

            if (dist <= 250.0) { // within 250m radius cluster threshold
                if (existing.getCluster() != null) {
                    targetCluster = existing.getCluster();
                    break;
                }
            }
        }

        if (targetCluster == null) {
            // Check if another report exists nearby without a cluster to form a new cluster
            for (Report existing : activeCategoryReports) {
                if (existing.getId().equals(newReport.getId())) continue;

                double dist = distanceService.calculateHaversineDistanceMeters(
                        newReport.getLatitude(), newReport.getLongitude(),
                        existing.getLatitude(), existing.getLongitude()
                );

                if (dist <= 250.0) {
                    targetCluster = ProblemCluster.builder()
                            .category(newReport.getCategory())
                            .centerLatitude((newReport.getLatitude() + existing.getLatitude()) / 2.0)
                            .centerLongitude((newReport.getLongitude() + existing.getLongitude()) / 2.0)
                            .reportCount(2)
                            .severity(newReport.getSeverity())
                            .priorityScore(65)
                            .status(ReportStatus.UNDER_REVIEW)
                            .affectedAreaMeters(dist + 50.0)
                            .firstReportedAt(existing.getCreatedAt() != null ? existing.getCreatedAt() : LocalDateTime.now())
                            .lastReportedAt(LocalDateTime.now())
                            .build();

                    targetCluster = clusterRepository.save(targetCluster);

                    existing.setCluster(targetCluster);
                    reportRepository.save(existing);
                    break;
                }
            }
        } else {
            // Add report to existing cluster & recalculate metrics
            targetCluster.setReportCount(targetCluster.getReportCount() + 1);
            targetCluster.setLastReportedAt(LocalDateTime.now());

            List<Report> clusterReports = reportRepository.findByClusterId(targetCluster.getId());
            double sumLat = newReport.getLatitude();
            double sumLng = newReport.getLongitude();
            for (Report r : clusterReports) {
                sumLat += r.getLatitude();
                sumLng += r.getLongitude();
            }
            int total = clusterReports.size() + 1;
            targetCluster.setCenterLatitude(sumLat / total);
            targetCluster.setCenterLongitude(sumLng / total);

            clusterRepository.save(targetCluster);
        }

        if (targetCluster != null) {
            newReport.setCluster(targetCluster);
            reportRepository.save(newReport);
        }
    }

    @Transactional
    public java.util.Map<String, Object> runFullClusteringAnalysis(AdminService adminService, com.civicpulse.entity.User currentUser) {
        long startNano = System.nanoTime();

        List<Report> allReports = reportRepository.findAll();
        List<Report> validReports = allReports.stream()
                .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                .collect(java.util.stream.Collectors.toList());

        int analyzedCount = validReports.size();

        for (Report report : validReports) {
            if (report.getCluster() == null) {
                processReportClustering(report);
            }
        }

        List<com.civicpulse.dto.ClusterDto> clusters = adminService.getAllClusters(currentUser);
        int clusterCount = clusters.size();

        long endNano = System.nanoTime();
        double durationSeconds = (endNano - startNano) / 1_000_000_000.0;
        String durationFormatted = String.format("%.2fs", Math.max(0.01, durationSeconds));

        String confidenceFormatted;
        if (analyzedCount == 0) {
            confidenceFormatted = "N/A";
        } else if (analyzedCount < 2) {
            confidenceFormatted = "Insufficient Data";
        } else {
            long clusteredPoints = validReports.stream().filter(r -> r.getCluster() != null).count();
            double ratio = (double) clusteredPoints / analyzedCount;
            double densityBonus = Math.min(1.0, analyzedCount / 10.0);
            int score = (int) Math.min(99, Math.round((ratio * 60.0) + (densityBonus * 25.0) + 14.0));
            confidenceFormatted = score + "%";
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("reportPointsAnalyzed", analyzedCount);
        result.put("problemClustersDetected", clusterCount);
        result.put("confidence", confidenceFormatted);
        result.put("analysisDuration", durationFormatted);
        result.put("clusters", clusters);

        return result;
    }
}

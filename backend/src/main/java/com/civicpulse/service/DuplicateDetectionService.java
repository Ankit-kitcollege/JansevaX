package com.civicpulse.service;

import com.civicpulse.dto.DuplicateCheckDto;
import com.civicpulse.dto.ReportCreateDto;
import com.civicpulse.dto.ReportResponseDto;
import com.civicpulse.entity.Report;
import com.civicpulse.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DuplicateDetectionService {

    private final ReportRepository reportRepository;

    /**
     * Checks if a newly submitted report has a duplicate nearby
     */
    public DuplicateCheckDto checkForDuplicates(ReportCreateDto dto, ReportResponseDtoMapper mapper) {
        List<Report> activeReports = reportRepository.findActiveByCategory(dto.getCategory());

        for (Report existing : activeReports) {
            double distanceMeters = calculateHaversineDistanceMeters(
                    dto.getLatitude(), dto.getLongitude(),
                    existing.getLatitude(), existing.getLongitude()
            );

            if (distanceMeters <= 150.0) { // within 150 meters
                return DuplicateCheckDto.builder()
                        .isDuplicateFound(true)
                        .message(String.format("Similar %s problem already reported nearby (%.0f meters away). You can support the existing report instead of creating a duplicate.",
                                dto.getCategory().name().replace("_", " "), distanceMeters))
                        .distanceMeters(distanceMeters)
                        .existingReport(mapper.toDto(existing, null))
                        .build();
            }
        }

        return DuplicateCheckDto.builder()
                .isDuplicateFound(false)
                .message("No duplicate reports found nearby.")
                .distanceMeters(0.0)
                .existingReport(null)
                .build();
    }

    public double calculateHaversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of Earth in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

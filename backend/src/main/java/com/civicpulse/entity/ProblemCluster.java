package com.civicpulse.entity;

import com.civicpulse.enums.ReportCategory;
import com.civicpulse.enums.ReportStatus;
import com.civicpulse.enums.SeverityLevel;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "problem_clusters")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemCluster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportCategory category;

    @Column(nullable = false)
    private Double centerLatitude;

    @Column(nullable = false)
    private Double centerLongitude;

    @Column(nullable = false)
    private Integer reportCount;

    @Enumerated(EnumType.STRING)
    private SeverityLevel severity;

    private Integer priorityScore;

    @Enumerated(EnumType.STRING)
    private ReportStatus status;

    private Double affectedAreaMeters;

    private LocalDateTime firstReportedAt;

    private LocalDateTime lastReportedAt;
}

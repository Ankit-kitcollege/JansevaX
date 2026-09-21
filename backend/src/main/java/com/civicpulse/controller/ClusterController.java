package com.civicpulse.controller;

import com.civicpulse.dto.ClusterDto;
import com.civicpulse.entity.User;
import com.civicpulse.service.AdminService;
import com.civicpulse.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clusters")
@RequiredArgsConstructor
public class ClusterController {

    private final AdminService adminService;
    private final AuthService authService;
    private final com.civicpulse.service.ProblemClusteringEngine clusteringEngine;

    @GetMapping
    public ResponseEntity<List<ClusterDto>> getAllClusters() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(adminService.getAllClusters(user));
    }

    @PostMapping("/analyze")
    public ResponseEntity<java.util.Map<String, Object>> runClusteringAnalysis() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(clusteringEngine.runFullClusteringAnalysis(adminService, user));
    }
}

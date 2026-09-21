package com.civicpulse.controller;

import com.civicpulse.dto.ClusterDto;
import com.civicpulse.dto.DepartmentDto;
import com.civicpulse.dto.UserDto;
import com.civicpulse.entity.User;
import com.civicpulse.service.AdminService;
import com.civicpulse.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    @GetMapping("/analytics")
    public ResponseEntity<AdminService.DashboardAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getDashboardAnalytics());
    }

    @GetMapping("/clusters")
    public ResponseEntity<List<ClusterDto>> getAllClusters() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(adminService.getAllClusters(user));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
}

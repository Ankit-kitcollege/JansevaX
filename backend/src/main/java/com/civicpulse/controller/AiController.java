package com.civicpulse.controller;

import com.civicpulse.service.AiAnalysisService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService aiAnalysisService;

    @Data
    public static class AiRequest {
        private String title;
        private String description;
    }

    @PostMapping("/analyze-text")
    public ResponseEntity<AiAnalysisService.AiRecommendation> analyzeText(@RequestBody AiRequest request) {
        return ResponseEntity.ok(aiAnalysisService.analyzeReportText(request.getTitle(), request.getDescription()));
    }
}

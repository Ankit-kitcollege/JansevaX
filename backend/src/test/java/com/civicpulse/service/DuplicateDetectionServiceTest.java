package com.civicpulse.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DuplicateDetectionServiceTest {

    @Test
    void testCalculateHaversineDistance_SameLocation() {
        DuplicateDetectionService service = new DuplicateDetectionService(null);
        double dist = service.calculateHaversineDistanceMeters(28.6139, 77.2090, 28.6139, 77.2090);
        assertEquals(0.0, dist, 0.001);
    }

    @Test
    void testCalculateHaversineDistance_NearbyLocations() {
        DuplicateDetectionService service = new DuplicateDetectionService(null);
        // ~330 meters difference
        double dist = service.calculateHaversineDistanceMeters(28.6139, 77.2090, 28.6169, 77.2090);
        assertTrue(dist > 300 && dist < 350);
    }
}

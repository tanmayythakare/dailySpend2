package com.example.dailyspend.controller;

import com.example.dailyspend.service.AnalyticsService;
import com.example.dailyspend.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    public AnalyticsController(AnalyticsService analyticsService, SecurityUtils securityUtils) {
        this.analyticsService = analyticsService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/income")
    public ResponseEntity<BigDecimal> totalIncome() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getTotalIncome(userId));
    }

    @GetMapping("/expense")
    public ResponseEntity<BigDecimal> totalExpense() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getTotalExpense(userId));
    }

    @GetMapping("/net")
    public ResponseEntity<BigDecimal> netBalance() {
        Long userId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getNetBalance(userId));
    }
}

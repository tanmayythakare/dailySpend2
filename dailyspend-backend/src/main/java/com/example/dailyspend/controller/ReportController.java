package com.example.dailyspend.controller;

import com.example.dailyspend.dto.*;
import com.example.dailyspend.service.ReportService;
import com.example.dailyspend.util.SecurityUtils;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;
    private final SecurityUtils securityUtils;

    public ReportController(ReportService reportService, SecurityUtils securityUtils) {
        this.reportService = reportService;
        this.securityUtils = securityUtils;
    }

    // ========== MONTHLY SUMMARY ==========

    /**
     * Get monthly financial summary
     * 
     * Example: GET /api/v1/reports/monthly?year=2026&month=2
     */
    @GetMapping("/monthly")
    public ResponseEntity<MonthlySummaryDto> getMonthlySummary(
            @RequestParam int year,
            @RequestParam int month) {
        
        Long userId = securityUtils.getCurrentUserId();
        MonthlySummaryDto summary = reportService.getMonthlySummary(year, month, userId);
        return ResponseEntity.ok(summary);
    }

    // ========== CATEGORY BREAKDOWN ==========

    /**
     * Get expense breakdown by category for a specific month
     * 
     * Example: GET /api/v1/reports/categories?year=2026&month=2
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategorySummaryDto>> getCategorySummary(
            @RequestParam int year,
            @RequestParam int month) {
        
        Long userId = securityUtils.getCurrentUserId();
        List<CategorySummaryDto> categories = reportService.getCategorySummary(year, month, userId);
        return ResponseEntity.ok(categories);
    }

    // ========== PERSON LEDGER ==========

    /**
     * Get ledger summary for all people
     * 
     * Example: GET /api/v1/reports/people
     */
    @GetMapping("/people")
    public ResponseEntity<List<PersonLedgerSummaryDto>> getPersonLedgerSummary() {
        Long userId = securityUtils.getCurrentUserId();
        List<PersonLedgerSummaryDto> ledger = reportService.getPersonLedgerSummary(userId);
        return ResponseEntity.ok(ledger);
    }

    /**
     * Get ledger summary for a specific person
     * 
     * Example: GET /api/v1/reports/people/3
     */
    @GetMapping("/people/{personId}")
    public ResponseEntity<PersonLedgerSummaryDto> getPersonLedgerSummary(
            @PathVariable Long personId) {
        
        Long userId = securityUtils.getCurrentUserId();
        PersonLedgerSummaryDto ledger = reportService.getPersonLedgerSummary(personId, userId);
        return ResponseEntity.ok(ledger);
    }

    // ========== DATE RANGE SUMMARY ==========

    /**
     * Get financial summary for a custom date range
     * 
     * Example: GET /api/v1/reports/summary?startDate=2026-02-01&endDate=2026-02-07
     */
    @GetMapping("/summary")
    public ResponseEntity<DateRangeSummaryDto> getDateRangeSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Long userId = securityUtils.getCurrentUserId();
        DateRangeSummaryDto summary = reportService.getDateRangeSummary(startDate, endDate, userId);
        return ResponseEntity.ok(summary);
    }
}
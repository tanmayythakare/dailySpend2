package com.example.dailyspend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DateRangeSummaryDto {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalExpenses;
    private BigDecimal totalMoneyGiven;
    private BigDecimal totalMoneyTaken;
    private BigDecimal totalIncome;
    private BigDecimal netCashFlow;
    private long transactionCount;

    // ===== Constructors =====

    public DateRangeSummaryDto() {
    }

    public DateRangeSummaryDto(
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal totalExpenses,
            BigDecimal totalMoneyGiven,
            BigDecimal totalMoneyTaken,
            BigDecimal totalIncome,
            BigDecimal netCashFlow,
            long transactionCount) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalExpenses = totalExpenses;
        this.totalMoneyGiven = totalMoneyGiven;
        this.totalMoneyTaken = totalMoneyTaken;
        this.totalIncome = totalIncome;
        this.netCashFlow = netCashFlow;
        this.transactionCount = transactionCount;
    }

    // ===== Getters & Setters =====

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getTotalMoneyGiven() {
        return totalMoneyGiven;
    }

    public void setTotalMoneyGiven(BigDecimal totalMoneyGiven) {
        this.totalMoneyGiven = totalMoneyGiven;
    }

    public BigDecimal getTotalMoneyTaken() {
        return totalMoneyTaken;
    }

    public void setTotalMoneyTaken(BigDecimal totalMoneyTaken) {
        this.totalMoneyTaken = totalMoneyTaken;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getNetCashFlow() {
        return netCashFlow;
    }

    public void setNetCashFlow(BigDecimal netCashFlow) {
        this.netCashFlow = netCashFlow;
    }

    public long getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(long transactionCount) {
        this.transactionCount = transactionCount;
    }
}
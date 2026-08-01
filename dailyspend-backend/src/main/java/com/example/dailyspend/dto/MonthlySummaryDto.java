package com.example.dailyspend.dto;

import java.math.BigDecimal;

public class MonthlySummaryDto {

    private int year;
    private int month;
    private BigDecimal totalExpenses;
    private BigDecimal totalMoneyGiven;
    private BigDecimal totalMoneyTaken;
    private BigDecimal totalIncome;
    private BigDecimal netCashFlow;
    private long transactionCount;

    // ===== Constructors =====

    public MonthlySummaryDto() {
    }

    public MonthlySummaryDto(
            int year,
            int month,
            BigDecimal totalExpenses,
            BigDecimal totalMoneyGiven,
            BigDecimal totalMoneyTaken,
            BigDecimal totalIncome,
            BigDecimal netCashFlow,
            long transactionCount) {
        this.year = year;
        this.month = month;
        this.totalExpenses = totalExpenses;
        this.totalMoneyGiven = totalMoneyGiven;
        this.totalMoneyTaken = totalMoneyTaken;
        this.totalIncome = totalIncome;
        this.netCashFlow = netCashFlow;
        this.transactionCount = transactionCount;
    }

    // ===== Getters & Setters =====

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
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
package com.example.dailyspend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class RecurringTransactionRequestDto {

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private String type; // 'EXPENSE', 'INCOME'

    @NotNull
    private String description;

    @NotNull
    private String frequency; // 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull
    private Long accountId;

    private Long categoryId;

    // ===== Getters & Setters =====
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

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

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}

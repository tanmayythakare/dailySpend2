package com.example.dailyspend.service;

import com.example.dailyspend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public AnalyticsService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal getTotalIncome(Long userId) {
        return transactionRepository.totalIncome(userId);
    }

    public BigDecimal getTotalExpense(Long userId) {
        return transactionRepository.totalExpense(userId);
    }

    public BigDecimal getNetBalance(Long userId) {
        return getTotalIncome(userId).subtract(getTotalExpense(userId));
    }
}

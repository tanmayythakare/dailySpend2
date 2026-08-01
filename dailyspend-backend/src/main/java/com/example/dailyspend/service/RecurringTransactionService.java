package com.example.dailyspend.service;

import com.example.dailyspend.dto.RecurringTransactionRequestDto;
import com.example.dailyspend.entity.*;
import com.example.dailyspend.exception.ForbiddenException;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.*;
import com.example.dailyspend.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class RecurringTransactionService {

    private static final Logger log = LoggerFactory.getLogger(RecurringTransactionService.class);

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

    public RecurringTransactionService(
            RecurringTransactionRepository recurringTransactionRepository,
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            SecurityUtils securityUtils) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public RecurringTransaction create(RecurringTransactionRequestDto request) {
        Long userId = securityUtils.getCurrentUserId();

        Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findAccessibleById(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            if ("INCOME".equals(request.getType()) && !"INCOME".equals(category.getType())) {
                throw new IllegalArgumentException("Category type mismatch: INCOME transactions require INCOME categories");
            }
            if ("EXPENSE".equals(request.getType()) && !"EXPENSE".equals(category.getType())) {
                throw new IllegalArgumentException("Category type mismatch: EXPENSE transactions require EXPENSE categories");
            }
        }

        RecurringTransaction template = new RecurringTransaction();
        template.setAmount(request.getAmount());
        template.setType(request.getType().toUpperCase());
        template.setDescription(request.getDescription());
        template.setFrequency(request.getFrequency().toUpperCase());
        template.setStartDate(request.getStartDate());
        template.setEndDate(request.getEndDate());
        template.setAccount(account);
        template.setCategory(category);
        template.setStatus("ACTIVE");
        template.setNextExecutionDate(request.getStartDate());

        User user = new User();
        user.setId(userId);
        template.setUser(user);

        // Save first so we have an ID for transaction association
        template = recurringTransactionRepository.save(template);

        // Run execution and catch-up immediately if start_date is today or in the past
        runExecutionAndCatchUp(template, LocalDate.now());

        return template;
    }

    @Transactional(readOnly = true)
    public List<RecurringTransaction> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return recurringTransactionRepository.findAllByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Optional<RecurringTransaction> findById(Long id) {
        Long userId = securityUtils.getCurrentUserId();
        return recurringTransactionRepository.findByIdAndUserId(id, userId);
    }

    @Transactional
    public RecurringTransaction updateStatus(Long id, String status) {
        Long userId = securityUtils.getCurrentUserId();
        RecurringTransaction template = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));

        if (!template.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Unauthorized");
        }

        String targetStatus = status.toUpperCase();
        if (!"ACTIVE".equals(targetStatus) && !"PAUSED".equals(targetStatus) && !"COMPLETED".equals(targetStatus)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        template.setStatus(targetStatus);
        template = recurringTransactionRepository.save(template);

        if ("ACTIVE".equals(targetStatus)) {
            runExecutionAndCatchUp(template, LocalDate.now());
        }

        return template;
    }

    @Transactional
    public void delete(Long id) {
        Long userId = securityUtils.getCurrentUserId();
        RecurringTransaction template = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));

        if (!template.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Unauthorized");
        }

        recurringTransactionRepository.delete(template);
    }

    @Scheduled(cron = "0 5 0 * * ?") // Daily at 12:05 AM
    @Transactional
    public void processRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTemplates =
                recurringTransactionRepository.findAllByStatusAndNextExecutionDateLessThanEqual("ACTIVE", today);

        for (RecurringTransaction template : dueTemplates) {
            try {
                runExecutionAndCatchUp(template, today);
            } catch (Exception e) {
                log.error("Failed to execute recurring template ID {}: {}", template.getId(), e.getMessage(), e);
            }
        }
    }

    private void runExecutionAndCatchUp(RecurringTransaction template, LocalDate today) {
        LocalDate runDate = template.getNextExecutionDate();

        while (!runDate.isAfter(today)) {
            Transaction txn = new Transaction();
            txn.setAmount(template.getAmount());
            txn.setTransactionDate(runDate);
            txn.setDescription(template.getDescription() + " (Recurring)");
            txn.setAccount(template.getAccount());
            txn.setCategory(template.getCategory());
            txn.setUser(template.getUser());
            txn.setType(TransactionType.valueOf(template.getType()));
            txn.setRecurringTransaction(template);
            transactionRepository.save(txn);

            // Update account balance
            Account account = template.getAccount();
            if ("EXPENSE".equals(template.getType())) {
                account.setBalance(account.getBalance().subtract(template.getAmount()));
            } else {
                account.setBalance(account.getBalance().add(template.getAmount()));
            }
            accountRepository.save(account);

            runDate = calculateNextDate(runDate, template.getFrequency());

            // Terminate if we exceed end_date
            if (template.getEndDate() != null && runDate.isAfter(template.getEndDate())) {
                template.setStatus("COMPLETED");
                break;
            }
        }

        template.setNextExecutionDate(runDate);
        recurringTransactionRepository.save(template);
    }

    private LocalDate calculateNextDate(LocalDate date, String frequency) {
        switch (frequency.toUpperCase()) {
            case "DAILY":
                return date.plusDays(1);
            case "WEEKLY":
                return date.plusWeeks(1);
            case "MONTHLY":
                return date.plusMonths(1);
            case "QUARTERLY":
                return date.plusMonths(3);
            case "YEARLY":
                return date.plusYears(1);
            default:
                throw new IllegalArgumentException("Unknown frequency: " + frequency);
        }
    }
}

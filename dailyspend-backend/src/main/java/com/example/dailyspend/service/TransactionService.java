package com.example.dailyspend.service;

import com.example.dailyspend.dto.*;
import com.example.dailyspend.entity.*;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.exception.ForbiddenException;
import com.example.dailyspend.repository.*;
import com.example.dailyspend.specification.TransactionSpecification;
import com.example.dailyspend.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final PersonRepository personRepository;
    private final SecurityUtils securityUtils;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            PersonRepository personRepository,
            SecurityUtils securityUtils) {

        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.personRepository = personRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        throw new UnsupportedOperationException(
                "Use semantic APIs: /transactions/expense, /money-given, /money-taken"
        );
    }

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return transactionRepository.findByUserIdAndDeletedFalse(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Transaction> findById(Long id) {
        Long userId = securityUtils.getCurrentUserId();
        return transactionRepository.findByIdAndUserId(id, userId);
    }

    @Transactional
    public Transaction createExpense(ExpenseRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                request.getCategoryId(),
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.EXPENSE);
        applyBalanceEffect(tx, true);

        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction createMoneyGiven(MoneyGivenRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                null,
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.MONEY_GIVEN);
        applyBalanceEffect(tx, true);

        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction createMoneyTaken(MoneyTakenRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                null,
                request.getPersonId(),
                request.getDescription(),
                request.getTransactionDate()
        );

        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.MONEY_TAKEN);
        applyBalanceEffect(tx, true);

        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction createIncome(IncomeRequestDto request) {

        Transaction tx = createBaseTransaction(
                request.getAccountId(),
                request.getCategoryId(),
                null,
                request.getDescription(),
                request.getTransactionDate()
        );

        if (tx.getCategory() != null && !"INCOME".equals(tx.getCategory().getType())) {
            throw new IllegalArgumentException("Category type mismatch: INCOME transactions require INCOME categories");
        }

        tx.setAmount(request.getAmount());
        tx.setType(TransactionType.INCOME);
        applyBalanceEffect(tx, true);

        return transactionRepository.save(tx);
    }

    @Transactional
    public Transaction updateTransaction(Long transactionId, TransactionUpdateRequest request) {

        Long userId = securityUtils.getCurrentUserId();

        Transaction existing = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!existing.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Unauthorized");
        }

        // Revert old balance effect before applying new changes
        applyBalanceEffect(existing, false);

        if (request.getAmount() != null) {
            existing.setAmount(request.getAmount());
        }

        if (request.getType() != null) {
            existing.setType(request.getType());
        }

        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getTransactionDate() != null) {
            existing.setTransactionDate(request.getTransactionDate());
        }

        if (request.getAccountId() != null) {
            Account account = accountRepository.findByIdAndUserId(request.getAccountId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
            existing.setAccount(account);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findAccessibleById(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            existing.setCategory(category);
        } else {
            existing.setCategory(null);
        }

        if (request.getPersonId() != null) {
            Person person = personRepository.findByIdAndUserId(request.getPersonId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
            existing.setPerson(person);
        } else {
            existing.setPerson(null);
        }

        // Apply new balance effect with updated details
        applyBalanceEffect(existing, true);

        return transactionRepository.save(existing);
    }

    @Transactional
    public void deleteTransaction(Long transactionId) {

        Long userId = securityUtils.getCurrentUserId();

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!tx.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Unauthorized");
        }

        if (tx.isDeleted()) return;

        applyBalanceEffect(tx, false);
        tx.setDeleted(true);
        transactionRepository.save(tx);
    }

    @Transactional(readOnly = true)
    public Page<Transaction> filterTransactions(TransactionFilterDto filter, Pageable pageable) {

        Long userId = securityUtils.getCurrentUserId();

        Specification<Transaction> spec =
                TransactionSpecification.hasUser(userId)
                        .and(TransactionSpecification.isNotDeleted())
                        .and(TransactionSpecification.hasAccount(filter.getAccountId()))
                        .and(TransactionSpecification.hasType(filter.getType()))
                        .and(TransactionSpecification.hasPerson(filter.getPersonId()))
                        .and(TransactionSpecification.betweenDates(
                                filter.getStartDate(),
                                filter.getEndDate()
                        ));

        return transactionRepository.findAll(spec, pageable);
    }

    private void applyBalanceEffect(Transaction tx, boolean apply) {

        Account account = tx.getAccount();
        BigDecimal amount = tx.getAmount();

        if (account == null || amount == null) {
            throw new IllegalStateException("Account or amount cannot be null");
        }

        if (!apply) {
            amount = amount.negate();
        }

        switch (tx.getType()) {

            case EXPENSE:
            case MONEY_GIVEN:
                account.setBalance(account.getBalance().subtract(amount));
                break;

            case INCOME:
            case MONEY_TAKEN:
                account.setBalance(account.getBalance().add(amount));
                break;

            default:
                throw new IllegalStateException("Unknown transaction type");
        }

        accountRepository.save(account);
    }

    @Transactional
    public List<Transaction> createBatchTransactions(List<BatchTransactionItemDto> requests) {
        List<Transaction> created = new java.util.ArrayList<>();
        for (BatchTransactionItemDto req : requests) {
            Transaction tx = createBaseTransaction(
                    req.getAccountId(),
                    req.getCategoryId(),
                    req.getPersonId(),
                    req.getDescription(),
                    req.getTransactionDate()
            );
            tx.setAmount(req.getAmount());
            tx.setType(req.getType());
            applyBalanceEffect(tx, true);
            created.add(transactionRepository.save(tx));
        }
        return created;
    }

    private Transaction createBaseTransaction(
            Long accountId,
            Long categoryId,
            Long personId,
            String description,
            LocalDate date) {

        Transaction tx = new Transaction();
        Long userId = securityUtils.getCurrentUserId();

        Account account = accountRepository
                .findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        tx.setAccount(account);
        tx.setCategory(categoryId != null
                ? categoryRepository.findAccessibleById(categoryId, userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found"))
                : null);

        tx.setPerson(personId != null
                ? personRepository.findByIdAndUserId(personId, userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Person not found"))
                : null);

        tx.setDescription(description);
        tx.setTransactionDate(date != null ? date : LocalDate.now());

        User user = new User();
        user.setId(userId);
        tx.setUser(user);

        return tx;
    }
    private Transaction save(Transaction tx) {
        return transactionRepository.save(tx);
    }
}

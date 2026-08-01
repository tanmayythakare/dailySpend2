package com.example.dailyspend.service;

import com.example.dailyspend.dto.RecurringTransactionRequestDto;
import com.example.dailyspend.entity.*;
import com.example.dailyspend.exception.ForbiddenException;
import com.example.dailyspend.repository.*;
import com.example.dailyspend.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecurringTransactionServiceTest {

    @Mock
    private RecurringTransactionRepository recurringTransactionRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private RecurringTransactionService recurringTransactionService;

    private User testUser;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testAccount = new Account();
        testAccount.setId(10L);
        testAccount.setName("Checking");
        testAccount.setBalance(new BigDecimal("1000.00"));
    }

    @Test
    void testCreateRecurringTransaction_FutureStartDate() {
        when(securityUtils.getCurrentUserId()).thenReturn(1L);
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testAccount));

        RecurringTransactionRequestDto request = new RecurringTransactionRequestDto();
        request.setAccountId(10L);
        request.setAmount(new BigDecimal("100.00"));
        request.setType("EXPENSE");
        request.setDescription("Netflix subscription");
        request.setFrequency("MONTHLY");
        request.setStartDate(LocalDate.now().plusDays(5));

        RecurringTransaction savedTemplate = new RecurringTransaction();
        savedTemplate.setId(100L);
        savedTemplate.setAmount(request.getAmount());
        savedTemplate.setType(request.getType());
        savedTemplate.setDescription(request.getDescription());
        savedTemplate.setFrequency(request.getFrequency());
        savedTemplate.setStartDate(request.getStartDate());
        savedTemplate.setNextExecutionDate(request.getStartDate());
        savedTemplate.setAccount(testAccount);
        savedTemplate.setUser(testUser);
        savedTemplate.setStatus("ACTIVE");

        when(recurringTransactionRepository.save(any(RecurringTransaction.class))).thenReturn(savedTemplate);

        RecurringTransaction result = recurringTransactionService.create(request);

        assertNotNull(result);
        assertEquals("ACTIVE", result.getStatus());
        assertEquals(LocalDate.now().plusDays(5), result.getNextExecutionDate());
        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void testCreateRecurringTransaction_PastStartDate_CatchUp() {
        when(securityUtils.getCurrentUserId()).thenReturn(1L);
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(testAccount));

        RecurringTransactionRequestDto request = new RecurringTransactionRequestDto();
        request.setAccountId(10L);
        request.setAmount(new BigDecimal("50.00"));
        request.setType("EXPENSE");
        request.setDescription("Gym weekly");
        request.setFrequency("WEEKLY");
        // Start date is 2 weeks ago (14 days)
        LocalDate startDate = LocalDate.now().minusWeeks(2);
        request.setStartDate(startDate);

        RecurringTransaction savedTemplate = new RecurringTransaction();
        savedTemplate.setId(100L);
        savedTemplate.setAmount(request.getAmount());
        savedTemplate.setType(request.getType());
        savedTemplate.setDescription(request.getDescription());
        savedTemplate.setFrequency(request.getFrequency());
        savedTemplate.setStartDate(request.getStartDate());
        savedTemplate.setNextExecutionDate(request.getStartDate());
        savedTemplate.setAccount(testAccount);
        savedTemplate.setUser(testUser);
        savedTemplate.setStatus("ACTIVE");

        when(recurringTransactionRepository.save(any(RecurringTransaction.class))).thenReturn(savedTemplate);

        RecurringTransaction result = recurringTransactionService.create(request);

        assertNotNull(result);
        // Catch-up should run for:
        // 1. startDate (2 weeks ago)
        // 2. startDate + 1 week (1 week ago)
        // 3. startDate + 2 weeks (today)
        // next execution date should be set to next week
        assertEquals(LocalDate.now().plusWeeks(1), result.getNextExecutionDate());
        verify(transactionRepository, times(3)).save(any(Transaction.class));
        // Verify account balance subtracted 3 * 50 = 150 -> balance is 850
        assertEquals(new BigDecimal("850.00"), testAccount.getBalance());
        verify(accountRepository, times(3)).save(testAccount);
    }

    @Test
    void testProcessRecurringTransactions_ActiveAndDue() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTemplates = new ArrayList<>();

        RecurringTransaction template = new RecurringTransaction();
        template.setId(100L);
        template.setAmount(new BigDecimal("1200.00"));
        template.setType("INCOME"); // Income recurring
        template.setDescription("Salary");
        template.setFrequency("MONTHLY");
        template.setStartDate(today.minusMonths(1));
        template.setNextExecutionDate(today.minusDays(2)); // Missed by 2 days
        template.setAccount(testAccount);
        template.setUser(testUser);
        template.setStatus("ACTIVE");

        dueTemplates.add(template);

        when(recurringTransactionRepository.findAllByStatusAndNextExecutionDateLessThanEqual("ACTIVE", today))
                .thenReturn(dueTemplates);

        recurringTransactionService.processRecurringTransactions();

        // Should log transaction for nextExecutionDate (2 days ago), update account balance
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        // Account balance added 1200.00 -> 2200.00
        assertEquals(new BigDecimal("2200.00"), testAccount.getBalance());
        verify(accountRepository, times(1)).save(testAccount);
        // Next execution date moved forward by 1 month from missed date
        assertEquals(today.minusDays(2).plusMonths(1), template.getNextExecutionDate());
        verify(recurringTransactionRepository, times(1)).save(template);
    }

    @Test
    void testToggleStatus_SecurityCheck_Fail() {
        when(securityUtils.getCurrentUserId()).thenReturn(1L);

        RecurringTransaction template = new RecurringTransaction();
        template.setId(100L);
        User anotherUser = new User();
        anotherUser.setId(2L); // Different owner
        template.setUser(anotherUser);

        when(recurringTransactionRepository.findById(100L)).thenReturn(Optional.of(template));

        assertThrows(ForbiddenException.class, () -> {
            recurringTransactionService.updateStatus(100L, "PAUSED");
        });
    }
}

package com.example.dailyspend.repository;

import com.example.dailyspend.dto.CategorySummaryDto;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.entity.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    // ================= USER SCOPED =================
    List<Transaction> findByUserIdAndDeletedFalse(Long userId);
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    // ================= BASIC =================
    List<Transaction> findByDeletedFalse();
    Page<Transaction> findByDeletedFalse(Pageable pageable);

    Page<Transaction> findByTransactionDateBetweenAndDeletedFalse(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    );

    Page<Transaction> findByTransactionDateBetween(
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    );

    boolean existsByPersonId(Long personId);
    boolean existsByAccountId(Long accountId);

    List<Transaction> findByPersonIdAndDeletedFalse(Long personId);

    // ================= ANALYTICS =================
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.type IN ('INCOME', 'MONEY_TAKEN')
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    BigDecimal totalIncome(@Param("userId") Long userId);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.type = 'INCOME'
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    BigDecimal totalIncomeNative(@Param("userId") Long userId);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.type IN ('EXPENSE', 'MONEY_GIVEN')
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    BigDecimal totalExpense(@Param("userId") Long userId);

    // ================= MONTHLY =================
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE YEAR(t.transactionDate) = :year
          AND MONTH(t.transactionDate) = :month
          AND t.type = :type
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    BigDecimal sumByYearMonthAndType(
            @Param("year") int year,
            @Param("month") int month,
            @Param("type") TransactionType type,
            @Param("userId") Long userId
    );

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
        WHERE YEAR(t.transactionDate) = :year
          AND MONTH(t.transactionDate) = :month
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    long countByYearMonth(
            @Param("year") int year,
            @Param("month") int month,
            @Param("userId") Long userId
    );

    @Query("""
        SELECT new com.example.dailyspend.dto.CategorySummaryDto(
            c.id,
            c.name,
            COALESCE(SUM(t.amount), 0),
            COUNT(t)
        )
        FROM Transaction t
        JOIN t.category c
        WHERE YEAR(t.transactionDate) = :year
          AND MONTH(t.transactionDate) = :month
          AND t.type = 'EXPENSE'
          AND t.user.id = :userId
          AND t.deleted = false
        GROUP BY c.id, c.name
        ORDER BY SUM(t.amount) DESC
    """)
    List<CategorySummaryDto> getCategorySummaryByMonth(
            @Param("year") int year,
            @Param("month") int month,
            @Param("userId") Long userId
    );

    // ================= PERSON LEDGER =================
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.person.id = :personId
          AND t.user.id = :userId
          AND t.type = 'MONEY_GIVEN'
          AND t.deleted = false
    """)
    BigDecimal sumMoneyGivenToPerson(@Param("personId") Long personId, @Param("userId") Long userId);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.person.id = :personId
          AND t.user.id = :userId
          AND t.type = 'MONEY_TAKEN'
          AND t.deleted = false
    """)
    BigDecimal sumMoneyTakenFromPerson(@Param("personId") Long personId, @Param("userId") Long userId);

    @Query("""
        SELECT MAX(t.transactionDate)
        FROM Transaction t
        WHERE t.person.id = :personId
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    LocalDate getLastTransactionDateForPerson(@Param("personId") Long personId, @Param("userId") Long userId);

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
        WHERE t.person.id = :personId
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    long countByPersonId(@Param("personId") Long personId, @Param("userId") Long userId);

    // ================= DATE RANGE =================
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.transactionDate BETWEEN :startDate AND :endDate
          AND t.type = :type
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    BigDecimal sumByDateRangeAndType(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") TransactionType type,
            @Param("userId") Long userId
    );

    @Query("""
        SELECT COUNT(t)
        FROM Transaction t
        WHERE t.transactionDate BETWEEN :startDate AND :endDate
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    long countByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("userId") Long userId
    );
}

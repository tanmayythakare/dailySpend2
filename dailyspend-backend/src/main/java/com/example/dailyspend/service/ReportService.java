package com.example.dailyspend.service;

import com.example.dailyspend.dto.*;
import com.example.dailyspend.entity.Person;
import com.example.dailyspend.entity.TransactionType;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.PersonRepository;
import com.example.dailyspend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final PersonRepository personRepository;

    public ReportService(
            TransactionRepository transactionRepository,
            PersonRepository personRepository) {
        this.transactionRepository = transactionRepository;
        this.personRepository = personRepository;
    }

    // ========== MONTHLY SUMMARY ==========

    /**
     * Get financial summary for a specific month
     */
    public MonthlySummaryDto getMonthlySummary(int year, int month, Long userId) {
        BigDecimal totalExpenses = transactionRepository.sumByYearMonthAndType(
                year, month, TransactionType.EXPENSE, userId
        );

        BigDecimal totalMoneyGiven = transactionRepository.sumByYearMonthAndType(
                year, month, TransactionType.MONEY_GIVEN, userId
        );

        BigDecimal totalMoneyTaken = transactionRepository.sumByYearMonthAndType(
                year, month, TransactionType.MONEY_TAKEN, userId
        );

        BigDecimal totalIncome = transactionRepository.sumByYearMonthAndType(
                year, month, TransactionType.INCOME, userId
        );

        long transactionCount = transactionRepository.countByYearMonth(year, month, userId);

        // Net cash flow = income + money taken - (expenses + money given)
        BigDecimal netCashFlow = totalIncome
                .add(totalMoneyTaken)
                .subtract(totalExpenses)
                .subtract(totalMoneyGiven);

        MonthlySummaryDto summary = new MonthlySummaryDto();
        summary.setYear(year);
        summary.setMonth(month);
        summary.setTotalExpenses(totalExpenses);
        summary.setTotalMoneyGiven(totalMoneyGiven);
        summary.setTotalMoneyTaken(totalMoneyTaken);
        summary.setTotalIncome(totalIncome);
        summary.setNetCashFlow(netCashFlow);
        summary.setTransactionCount(transactionCount);

        return summary;
    }

    // ========== CATEGORY BREAKDOWN ==========

    /**
     * Get expense breakdown by category for a specific month
     */
    public List<CategorySummaryDto> getCategorySummary(int year, int month, Long userId) {
        List<CategorySummaryDto> categories = transactionRepository
                .getCategorySummaryByMonth(year, month, userId);

        // Calculate percentages
        BigDecimal total = categories.stream()
                .map(CategorySummaryDto::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (total.compareTo(BigDecimal.ZERO) > 0) {
            categories.forEach(cat -> {
                BigDecimal percentage = cat.getTotalAmount()
                        .divide(total, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
                cat.setPercentage(percentage);
            });
        }

        return categories;
    }

    // ========== PERSON LEDGER SUMMARY ==========

    /**
     * Get summary of all people with their balances and transaction details
     */
    public List<PersonLedgerSummaryDto> getPersonLedgerSummary(Long userId) {
        List<Person> people = personRepository.findByUserId(userId);

        return people.stream()
                .map(person -> {
                    BigDecimal balance = personRepository.calculatePersonBalance(person.getId(), userId);
                    BigDecimal totalGiven = transactionRepository.sumMoneyGivenToPerson(person.getId(), userId);
                    BigDecimal totalTaken = transactionRepository.sumMoneyTakenFromPerson(person.getId(), userId);
                    LocalDate lastTransactionDate = transactionRepository.getLastTransactionDateForPerson(person.getId(), userId);
                    long transactionCount = transactionRepository.countByPersonId(person.getId(), userId);

                    return new PersonLedgerSummaryDto(
                            person.getId(),
                            person.getName(),
                            balance,
                            totalGiven,
                            totalTaken,
                            lastTransactionDate,
                            transactionCount
                    );
                })
                .filter(dto -> dto.getTransactionCount() > 0) // Only show people with transactions
                .toList();
    }

    /**
     * Get ledger summary for a specific person
     */
    public PersonLedgerSummaryDto getPersonLedgerSummary(Long personId, Long userId) {
        Person person = personRepository.findByIdAndUserId(personId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));

        BigDecimal balance = personRepository.calculatePersonBalance(personId, userId);
        BigDecimal totalGiven = transactionRepository.sumMoneyGivenToPerson(personId, userId);
        BigDecimal totalTaken = transactionRepository.sumMoneyTakenFromPerson(personId, userId);
        LocalDate lastTransactionDate = transactionRepository.getLastTransactionDateForPerson(personId, userId);
        long transactionCount = transactionRepository.countByPersonId(personId, userId);

        return new PersonLedgerSummaryDto(
                person.getId(),
                person.getName(),
                balance,
                totalGiven,
                totalTaken,
                lastTransactionDate,
                transactionCount
        );
    }

    // ========== DATE RANGE SUMMARY ==========

    /**
     * Get financial summary for a custom date range
     */
    public DateRangeSummaryDto getDateRangeSummary(LocalDate startDate, LocalDate endDate, Long userId) {
        BigDecimal totalExpenses = transactionRepository.sumByDateRangeAndType(
                startDate, endDate, TransactionType.EXPENSE, userId
        );

        BigDecimal totalMoneyGiven = transactionRepository.sumByDateRangeAndType(
                startDate, endDate, TransactionType.MONEY_GIVEN, userId
        );

        BigDecimal totalMoneyTaken = transactionRepository.sumByDateRangeAndType(
                startDate, endDate, TransactionType.MONEY_TAKEN, userId
        );

        BigDecimal totalIncome = transactionRepository.sumByDateRangeAndType(
                startDate, endDate, TransactionType.INCOME, userId
        );

        long transactionCount = transactionRepository.countByDateRange(startDate, endDate, userId);

        // Net cash flow = income + money taken - (expenses + money given)
        BigDecimal netCashFlow = totalIncome
                .add(totalMoneyTaken)
                .subtract(totalExpenses)
                .subtract(totalMoneyGiven);

        return new DateRangeSummaryDto(
                startDate,
                endDate,
                totalExpenses,
                totalMoneyGiven,
                totalMoneyTaken,
                totalIncome,
                netCashFlow,
                transactionCount
        );
    }
}
package com.example.dailyspend.repository;

import com.example.dailyspend.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findAllByStatusAndNextExecutionDateLessThanEqual(String status, LocalDate date);

    List<RecurringTransaction> findAllByUserId(Long userId);

    Optional<RecurringTransaction> findByIdAndUserId(Long id, Long userId);
}

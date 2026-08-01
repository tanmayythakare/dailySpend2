package com.example.dailyspend.repository;

import com.example.dailyspend.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person, Long> {

    // ================= USER SCOPED =================

    List<Person> findByUserId(Long userId);

    Optional<Person> findByIdAndUserId(Long id, Long userId);

    // ================= BUSINESS LOGIC =================

    /**
     * Calculate person balance:
     * Positive = they owe you
     * Negative = you owe them
     */
    @Query("""
        SELECT COALESCE(
            SUM(
                CASE
                    WHEN t.type = 'MONEY_GIVEN' THEN t.amount
                    WHEN t.type = 'MONEY_TAKEN' THEN -t.amount
                    ELSE 0
                END
            ), 0)
        FROM Transaction t
        WHERE t.person.id = :personId
          AND t.user.id = :userId
          AND t.deleted = false
    """)
    BigDecimal calculatePersonBalance(@Param("personId") Long personId, @Param("userId") Long userId);
}

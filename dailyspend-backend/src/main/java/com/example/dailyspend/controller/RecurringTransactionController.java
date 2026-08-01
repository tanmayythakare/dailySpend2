package com.example.dailyspend.controller;

import com.example.dailyspend.dto.RecurringTransactionRequestDto;
import com.example.dailyspend.dto.RecurringTransactionResponseDto;
import com.example.dailyspend.entity.RecurringTransaction;
import com.example.dailyspend.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recurring-transactions")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }

    @PostMapping
    public ResponseEntity<RecurringTransactionResponseDto> create(
            @Valid @RequestBody RecurringTransactionRequestDto request) {
        RecurringTransaction rt = recurringTransactionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(rt));
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponseDto>> getAll() {
        List<RecurringTransactionResponseDto> response = recurringTransactionService.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringTransactionResponseDto> getById(@PathVariable Long id) {
        return recurringTransactionService.findById(id)
                .map(rt -> ResponseEntity.ok(toResponse(rt)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RecurringTransactionResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        RecurringTransaction rt = recurringTransactionService.updateStatus(id, status);
        return ResponseEntity.ok(toResponse(rt));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recurringTransactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private RecurringTransactionResponseDto toResponse(RecurringTransaction rt) {
        RecurringTransactionResponseDto dto = new RecurringTransactionResponseDto();
        dto.setId(rt.getId());
        dto.setAmount(rt.getAmount());
        dto.setType(rt.getType());
        dto.setDescription(rt.getDescription());
        dto.setFrequency(rt.getFrequency());
        dto.setStartDate(rt.getStartDate());
        dto.setEndDate(rt.getEndDate());
        dto.setNextExecutionDate(rt.getNextExecutionDate());
        dto.setStatus(rt.getStatus());

        if (rt.getAccount() != null) {
            dto.setAccountId(rt.getAccount().getId());
            dto.setAccountName(rt.getAccount().getName());
        }

        if (rt.getCategory() != null) {
            dto.setCategoryId(rt.getCategory().getId());
            dto.setCategoryName(rt.getCategory().getName());
        }

        return dto;
    }
}

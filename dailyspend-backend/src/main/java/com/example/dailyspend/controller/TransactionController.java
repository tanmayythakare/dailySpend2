package com.example.dailyspend.controller;

import com.example.dailyspend.dto.*;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.service.TransactionService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // -------- BASIC READ APIs (SAFE) --------

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions() {
        List<TransactionResponse> response = transactionService.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable Long id) {
        return transactionService.findById(id)
                .map(tx -> ResponseEntity.ok(toResponse(tx)))
                .orElse(ResponseEntity.notFound().build());
    }

    // -------- CREATE APIs --------

    @PostMapping("/expense")
    public ResponseEntity<TransactionResponse> createExpense(
            @Valid @RequestBody ExpenseRequestDto request) {

        Transaction tx = transactionService.createExpense(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(tx));
    }

    @PostMapping("/money-given")
    public ResponseEntity<TransactionResponse> createMoneyGiven(
            @Valid @RequestBody MoneyGivenRequestDto request) {

        Transaction tx = transactionService.createMoneyGiven(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(tx));
    }

    @PostMapping("/money-taken")
    public ResponseEntity<TransactionResponse> createMoneyTaken(
            @Valid @RequestBody MoneyTakenRequestDto request) {

        Transaction tx = transactionService.createMoneyTaken(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(tx));
    }

    @PostMapping("/income")
    public ResponseEntity<TransactionResponse> createIncome(
            @Valid @RequestBody IncomeRequestDto request) {

        Transaction tx = transactionService.createIncome(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(tx));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<TransactionResponse>> createBatchTransactions(
            @RequestBody List<BatchTransactionItemDto> requests) {
        List<Transaction> created = transactionService.createBatchTransactions(requests);
        List<TransactionResponse> response = new java.util.ArrayList<>();
        for (Transaction tx : created) {
            response.add(toResponse(tx));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // -------- UPDATE --------

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionUpdateRequest request) {

        Transaction updated = transactionService.updateTransaction(id, request);
        return ResponseEntity.ok(toResponse(updated));
    }

    // -------- DELETE --------

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    // -------- FILTER --------

    @GetMapping("/filter")
    public ResponseEntity<Page<TransactionResponse>> filterTransactions(
    		 @ModelAttribute TransactionFilterDto filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(direction), sortBy)
        );

        Page<TransactionResponse> response =
                transactionService.filterTransactions(filter, pageable)
                        .map(this::toResponse);

        return ResponseEntity.ok(response);
    }

    // -------- RESPONSE MAPPER (CRITICAL FIX) --------

    private TransactionResponse toResponse(Transaction tx) {
    TransactionResponse response = new TransactionResponse();

    response.setId(tx.getId());
    response.setAmount(tx.getAmount());
    response.setType(tx.getType());  // ✅ ADDED
    response.setTransactionDate(tx.getTransactionDate());
    response.setDescription(tx.getDescription());

    // ✅ CREATE NESTED OBJECTS
    if (tx.getAccount() != null) {
        response.setAccount(new TransactionResponse.AccountInfo(
            tx.getAccount().getId(),
            tx.getAccount().getName()
        ));
    }

    if (tx.getCategory() != null) {
        response.setCategory(new TransactionResponse.CategoryInfo(
            tx.getCategory().getId(),
            tx.getCategory().getName()
        ));
    }

    if (tx.getPerson() != null) {
        response.setPerson(new TransactionResponse.PersonInfo(
            tx.getPerson().getId(),
            tx.getPerson().getName()
        ));
    }

    return response;
}
}

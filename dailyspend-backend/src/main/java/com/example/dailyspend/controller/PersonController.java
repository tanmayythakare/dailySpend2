package com.example.dailyspend.controller;

import com.example.dailyspend.dto.PersonBalanceDto;
import com.example.dailyspend.dto.PersonRequest;
import com.example.dailyspend.dto.PersonResponse;
import com.example.dailyspend.dto.TransactionResponse;  // ✅ ADD THIS
import com.example.dailyspend.dto.UpiQrPayloadDto;
import com.example.dailyspend.entity.Person;
import com.example.dailyspend.service.PersonService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/people")
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    // -------- CRUD ENDPOINTS --------

    @GetMapping
    public ResponseEntity<List<PersonResponse>> getAllPeople() {
        List<Person> people = personService.findAll();
        List<PersonResponse> response = people.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonResponse> getPersonById(@PathVariable Long id) {
        Person person = personService.findById(id);
        return ResponseEntity.ok(toResponse(person));
    }

    @PostMapping
    public ResponseEntity<PersonResponse> createPerson(
            @Valid @RequestBody PersonRequest request) {
        Person person = new Person();
        person.setName(request.getName());
        Person saved = personService.save(person);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonResponse> updatePerson(
            @PathVariable Long id,
            @Valid @RequestBody PersonRequest request) {
        Person personDetails = new Person();
        personDetails.setName(request.getName());
        Person updated = personService.update(id, personDetails);
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable Long id) {
        personService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // -------- BALANCE ENDPOINTS --------

    @GetMapping("/{id}/balance")
    public ResponseEntity<BigDecimal> getPersonBalance(@PathVariable Long id) {
        BigDecimal balance = personService.getPersonBalance(id);
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionResponse>> getPersonTransactions(@PathVariable Long id) {
        // ✅ FIXED: Use the service method that returns DTOs
        List<TransactionResponse> response = personService.getPersonTransactionResponses(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/with-balances")
    public ResponseEntity<List<PersonBalanceDto>> getAllPeopleWithBalances() {
        List<PersonBalanceDto> people = personService.getAllPeopleWithBalances();
        return ResponseEntity.ok(people);
    }

    @GetMapping("/{id}/with-balance")
    public ResponseEntity<PersonBalanceDto> getPersonWithBalance(@PathVariable Long id) {
        PersonBalanceDto personBalance = personService.getPersonWithBalance(id);
        return ResponseEntity.ok(personBalance);
    }

    @GetMapping("/{id}/qr-payload")
    public ResponseEntity<UpiQrPayloadDto> getPersonQrPayload(@PathVariable Long id) {
        UpiQrPayloadDto payload = personService.getQrPayload(id);
        return ResponseEntity.ok(payload);
    }

    // -------- MAPPER --------

    private PersonResponse toResponse(Person person) {
        PersonResponse response = new PersonResponse();
        response.setId(person.getId());
        response.setName(person.getName());
        return response;
    }
}
package com.example.dailyspend.service;

import com.example.dailyspend.dto.PersonBalanceDto;
import com.example.dailyspend.dto.TransactionResponse;
import com.example.dailyspend.entity.Person;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.entity.User;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.PersonRepository;
import com.example.dailyspend.repository.TransactionRepository;
import com.example.dailyspend.util.SecurityUtils;
import com.example.dailyspend.dto.UpiQrPayloadDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PersonService {

    private static final Logger log = LoggerFactory.getLogger(PersonService.class);

    @Value("${app.upi.max-collection-amount:25000.00}")
    private BigDecimal maxCollectionAmount;

    private final PersonRepository personRepository;
    private final TransactionRepository transactionRepository;
    private final SecurityUtils securityUtils;

    public PersonService(
            PersonRepository personRepository,
            TransactionRepository transactionRepository,
            SecurityUtils securityUtils) {
        this.personRepository = personRepository;
        this.transactionRepository = transactionRepository;
        this.securityUtils = securityUtils;
    }

    // -------- CRUD --------

    @Transactional(readOnly = true)
    public List<Person> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return personRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Person findById(Long id) {
        Long userId = securityUtils.getCurrentUserId();
        return personRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
    }

    @Transactional
    public Person save(Person person) {
        User user = new User();
        user.setId(securityUtils.getCurrentUserId());
        person.setUser(user);
        return personRepository.save(person);
    }

    @Transactional
    public Person update(Long id, Person personDetails) {
        Person person = findById(id);
        person.setName(personDetails.getName());
        return personRepository.save(person);
    }

    @Transactional
    public void deleteById(Long id) {
        Person person = findById(id); // validates ownership

        boolean hasTransactions = transactionRepository.existsByPersonId(id);
        if (hasTransactions) {
            throw new IllegalStateException(
                "Cannot delete person with existing transactions"
            );
        }

        personRepository.delete(person);
    }

    // -------- BUSINESS LOGIC --------

    
    public BigDecimal getPersonBalance(Long personId) {
        findById(personId);
        Long userId = securityUtils.getCurrentUserId();
        return personRepository.calculatePersonBalance(personId, userId);
    }

    public List<Transaction> getPersonTransactions(Long personId) {
        findById(personId);
        return transactionRepository.findByPersonIdAndDeletedFalse(personId);
    }

    public PersonBalanceDto getPersonWithBalance(Long personId) {
        Person person = findById(personId);

        PersonBalanceDto dto = new PersonBalanceDto();
        dto.setId(person.getId());
        dto.setName(person.getName());
        dto.setBalance(getPersonBalance(personId));
        dto.setCreatedAt(person.getCreatedAt());

        return dto;
    }

    public List<PersonBalanceDto> getAllPeopleWithBalances() {
        Long userId = securityUtils.getCurrentUserId();
        return findAll().stream()
                .map(person -> {
                    PersonBalanceDto dto = new PersonBalanceDto();
                    dto.setId(person.getId());
                    dto.setName(person.getName());
                    dto.setBalance(personRepository.calculatePersonBalance(person.getId(), userId));
                    dto.setCreatedAt(person.getCreatedAt());
                    return dto;
                })
                .toList();
    }

    public List<TransactionResponse> getPersonTransactionResponses(Long personId) {
        return getPersonTransactions(personId).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UpiQrPayloadDto getQrPayload(Long personId) {
        Long userId = securityUtils.getCurrentUserId();
        
        // 1. Retrieve the debtor (person) directly to bypass default ownership checks in findById
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
        
        // 2. Explicit IDOR Check
        if (!person.getUser().getId().equals(userId)) {
            log.warn("IDOR ATTEMPT BLOCKED: User {} tried to access Person {} owned by User {}", 
                userId, personId, person.getUser().getId());
            throw new AccessDeniedException("You do not have access to this record");
        }
        
        // 3. Retrieve payee configuration
        User payeeUser = person.getUser();
        String upiId = payeeUser.getUpiId();
        if (upiId == null || upiId.trim().isEmpty()) {
            throw new IllegalStateException("Your UPI ID is not configured. Please set it in Settings.");
        }
        
        // 4. Double-check NPCI format validation
        if (!Pattern.compile("^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$").matcher(upiId).matches()) {
            throw new IllegalStateException("Configured UPI ID is invalid. Please update it in Settings.");
        }
        
        // 5. Compute outstanding balance
        BigDecimal balance = personRepository.calculatePersonBalance(personId, userId);
        if (balance == null || balance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("No outstanding collection balance available for " + person.getName());
        }
        
        // 6. Security limit gate
        if (balance.compareTo(maxCollectionAmount) > 0) {
            throw new IllegalArgumentException("Outstanding balance exceeds the safety collection limit of ₹" + maxCollectionAmount);
        }
        
        // 7. Extract names & prevent note overflows (cap name at 30 characters)
        String payeeName = payeeUser.getUpiDisplayName() != null && !payeeUser.getUpiDisplayName().trim().isEmpty() 
            ? payeeUser.getUpiDisplayName().trim() 
            : payeeUser.getUsername();
            
        String safeDebtorName = person.getName().length() > 30 
            ? person.getName().substring(0, 30) 
            : person.getName();
        String rawNote = "Settlement from " + safeDebtorName;
        
        // 8. Opaque Transaction Reference
        String txnRef = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        
        // 9. Audit Logging
        log.info("UPI QR PAYLOAD GENERATED: PayeeUser: {} | DebtorPerson: {} | Amount: {} | Ref: {}", 
            userId, personId, balance, txnRef);
        
        return new UpiQrPayloadDto(upiId, payeeName, balance, rawNote, txnRef);
    }

   private TransactionResponse toTransactionResponse(Transaction tx) {

    TransactionResponse response = new TransactionResponse();

    response.setId(tx.getId());
    response.setAmount(tx.getAmount());
    response.setType(tx.getType());
    response.setDescription(tx.getDescription());
    response.setTransactionDate(tx.getTransactionDate());

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

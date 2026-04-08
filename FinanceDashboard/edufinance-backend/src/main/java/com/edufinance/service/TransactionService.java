package com.edufinance.service;

import com.edufinance.dto.TransactionDTOs.*;
import com.edufinance.model.Transaction;
import com.edufinance.model.TransactionType;
import com.edufinance.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final FileStorageService fileStorageService; 
    private final Random random = new Random();

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardSummary(String branch) {
        LocalDate today = LocalDate.now();
        List<Transaction> todayTxs;
        List<Transaction> recentTxs;

        if ("ALL".equalsIgnoreCase(branch)) {
            todayTxs = transactionRepository.findByTransactionDate(today);
            recentTxs = transactionRepository.findTop10ByOrderByCreatedAtDesc();
        } else {
            todayTxs = transactionRepository.findByTransactionDateAndBranch(today, branch);
            recentTxs = transactionRepository.findTop10ByBranchOrderByCreatedAtDesc(branch);
        }

        BigDecimal income = todayTxs.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expense = todayTxs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal net = income.subtract(expense);

        List<TransactionResponse> recent = recentTxs.stream()
                .map(this::mapToResponse)
                .toList();

        return new DashboardResponse(income, expense, net, recent);
    }

    // NEW: Search Transactions logic
    @Transactional(readOnly = true)
    public List<TransactionResponse> searchTransactions(String branch, LocalDate startDate, LocalDate endDate, String name) {
        return transactionRepository.filterTransactions(branch, startDate, endDate, name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // NEW: Fetch Autocomplete Suggestions (Limit 3)
    @Transactional(readOnly = true)
    public List<String> getUserSuggestions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        // Limit query strictly to top 3
        return transactionRepository.searchDistinctReferenceNames(query, PageRequest.of(0, 3));
    }

    @Transactional
    public TransactionResponse recordIncome(IncomeRequest request, MultipartFile file) {
        log.info("Processing new income request for Branch: {}", request.branch());

        String receiptId = generateReferenceId("RCPT");
        String documentPath = fileStorageService.storeFile(file); 

        Transaction transaction = Transaction.builder()
                .transactionReference(receiptId)
                .type(TransactionType.INCOME)
                .branch(request.branch()) 
                .referenceName(request.studentName())
                .department(request.department())
                .description(request.purpose())
                .amount(request.amount())
                .transactionDate(request.date())
                .documentPath(documentPath) 
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    @Transactional
    public TransactionResponse recordExpense(ExpenseRequest request, MultipartFile file) {
        log.info("Processing new expense request for Branch: {}", request.branch());

        String expenseId = generateReferenceId("EXP");
        String documentPath = fileStorageService.storeFile(file); 

        Transaction transaction = Transaction.builder()
                .transactionReference(expenseId)
                .type(TransactionType.EXPENSE)
                .branch(request.branch()) 
                .referenceName(request.requestedBy())
                .department("N/A") 
                .category(request.category())
                .description(request.description())
                .amount(request.amount())
                .transactionDate(request.date())
                .documentPath(documentPath) 
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    // NEW: Edit Today's Transaction Logic
    @Transactional
    public TransactionResponse updateTodayTransaction(String reference, TransactionUpdateRequest request, MultipartFile file) {
        Transaction transaction = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // CORE SECURITY RULE: Block edits if transaction is not from today
        if (!transaction.getTransactionDate().equals(LocalDate.now())) {
            throw new RuntimeException("Edit restricted: Only today's transactions can be modified.");
        }

        transaction.setBranch(request.branch());
        transaction.setReferenceName(request.referenceName());
        transaction.setDepartment(request.department());
        transaction.setDescription(request.description());
        transaction.setCategory(request.category());
        transaction.setAmount(request.amount());

        if (file != null && !file.isEmpty()) {
            String documentPath = fileStorageService.storeFile(file);
            transaction.setDocumentPath(documentPath);
        }

        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToResponse(savedTransaction);
    }

    private String generateReferenceId(String prefix) {
        int year = Year.now().getValue();
        int randomNum = 1000 + random.nextInt(9000); 
        return String.format("%s-%d-%d", prefix, year, randomNum);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return new TransactionResponse(
            t.getTransactionReference(),
            t.getType().name(),
            t.getBranch(),
            t.getReferenceName(),
            t.getDepartment(),
            t.getDescription(),
            t.getCategory(),
            t.getAmount(),
            t.getTransactionDate(),
            t.getDocumentPath() 
        );
    }
}
package com.edufinance.controller;

import com.edufinance.dto.TransactionDTOs.*;
import com.edufinance.service.EmailService;
import com.edufinance.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class TransactionController {

    private final EmailService emailService;
    private final TransactionService transactionService;
    private final Map<String, Boolean> processedRequests = new ConcurrentHashMap<>();

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestParam(required = false, defaultValue = "ALL") String branch) {
        return ResponseEntity.ok(transactionService.getDashboardSummary(branch));
    }

    // NEW: Advanced Search Endpoint for Filters (Date Range, User Name, Branch)
    @GetMapping("/search")
    public ResponseEntity<List<TransactionResponse>> searchTransactions(
            @RequestParam(defaultValue = "ALL") String branch,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(transactionService.searchTransactions(branch, startDate, endDate, name));
    }

    // NEW: Autocomplete user name suggestions (limit 3)
    @GetMapping("/suggestions/users")
    public ResponseEntity<List<String>> getUserSuggestions(@RequestParam("q") String query) {
        return ResponseEntity.ok(transactionService.getUserSuggestions(query));
    }

    @PostMapping(value = "/income", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> logIncome(
            @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
            @Valid @RequestPart("data") IncomeRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        if (processedRequests.putIfAbsent(idempotencyKey, true) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Duplicate transaction detected. This request is already being processed.");
        }

        try {
            TransactionResponse response = transactionService.recordIncome(request, file);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            processedRequests.remove(idempotencyKey);
            throw e; 
        }
    }

    @PostMapping(value = "/expense", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> logExpense(
            @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
            @Valid @RequestPart("data") ExpenseRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        if (processedRequests.putIfAbsent(idempotencyKey, true) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Duplicate transaction detected. This request is already being processed.");
        }

        try {
            TransactionResponse response = transactionService.recordExpense(request, file);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            processedRequests.remove(idempotencyKey);
            throw e;
        }
    }

    // NEW: Edit Today's Transaction
    @PutMapping(value = "/{reference}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateTransaction(
            @PathVariable String reference,
            @Valid @RequestPart("data") TransactionUpdateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            TransactionResponse response = transactionService.updateTodayTransaction(reference, request, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/email-summary")
    public ResponseEntity<?> sendEmailSummary() {
        DashboardResponse summary = transactionService.getDashboardSummary("ALL");
        emailService.sendDailySummaryEmail(summary);
        return ResponseEntity.ok().body("{\"message\": \"Email dispatch triggered successfully\"}");
    }
}

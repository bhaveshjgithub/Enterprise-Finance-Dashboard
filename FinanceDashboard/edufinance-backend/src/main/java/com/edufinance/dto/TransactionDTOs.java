package com.edufinance.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TransactionDTOs {

    public record IncomeRequest(
            @NotBlank(message = "Branch/Institution is required") String branch, 
            @NotBlank(message = "Student Name/ID is required") String studentName,
            @NotBlank(message = "Department is required") String department,
            @NotBlank(message = "Purpose is required") String purpose,
            @NotNull(message = "Amount is required") @Positive(message = "Amount must be greater than zero") BigDecimal amount,
            @NotNull(message = "Date is required") LocalDate date
    ) {}

    public record ExpenseRequest(
            @NotBlank(message = "Branch/Institution is required") String branch, 
            @NotBlank(message = "Requested By is required") String requestedBy,
            @NotBlank(message = "Category is required") String category,
            @NotBlank(message = "Description is required") String description,
            @NotNull(message = "Amount is required") @Positive(message = "Amount must be greater than zero") BigDecimal amount,
            @NotNull(message = "Date is required") LocalDate date
    ) {}

    // NEW: Shared Update Request Payload for Edits
    public record TransactionUpdateRequest(
            @NotBlank(message = "Branch/Institution is required") String branch,
            @NotBlank(message = "Reference Name is required") String referenceName,
            @NotBlank(message = "Department is required") String department,
            @NotBlank(message = "Description is required") String description,
            String category, // Optional depending on Income vs Expense
            @NotNull(message = "Amount is required") @Positive(message = "Amount must be greater than zero") BigDecimal amount
    ) {}

    public record TransactionResponse(
            String transactionReference,
            String type,
            String branch, 
            String referenceName,
            String department,
            String description,
            String category,
            BigDecimal amount,
            LocalDate transactionDate,
            String documentPath 
    ) {}

    public record DashboardResponse(
            BigDecimal totalIncome,
            BigDecimal totalExpense,
            BigDecimal netBalance,
            List<TransactionResponse> recentTransactions
    ) {}
}

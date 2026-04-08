package com.edufinance.repository;

import com.edufinance.model.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Optional<Transaction> findByTransactionReference(String transactionReference);
    
    List<Transaction> findByTransactionDate(LocalDate date);
    List<Transaction> findTop10ByOrderByCreatedAtDesc();

    List<Transaction> findByTransactionDateAndBranch(LocalDate date, String branch);
    List<Transaction> findTop10ByBranchOrderByCreatedAtDesc(String branch);

    // NEW: Search for Autocomplete (Distinct Reference Names)
    @Query("SELECT DISTINCT t.referenceName FROM Transaction t WHERE LOWER(t.referenceName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<String> searchDistinctReferenceNames(@Param("query") String query, Pageable pageable);

    // NEW: Advanced Filter Query (Handles optional parameters like date ranges and user names)
    @Query("SELECT t FROM Transaction t WHERE " +
           "(:branch = 'ALL' OR t.branch = :branch) AND " +
           "(cast(:startDate as date) IS NULL OR t.transactionDate >= :startDate) AND " +
           "(cast(:endDate as date) IS NULL OR t.transactionDate <= :endDate) AND " +
           "(:name IS NULL OR t.referenceName = :name) " +
           "ORDER BY t.transactionDate DESC, t.createdAt DESC")
    List<Transaction> filterTransactions(
            @Param("branch") String branch,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("name") String name
    );
}

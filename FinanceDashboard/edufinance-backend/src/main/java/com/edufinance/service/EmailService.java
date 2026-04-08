package com.edufinance.service;

import com.edufinance.dto.TransactionDTOs.DashboardResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendDailySummaryEmail(DashboardResponse summary) {
        String targetEmail = "bhavesh.jivrakh2@gmail.com";
        log.info("Sending daily summary email to: {}", targetEmail);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            message.setTo(targetEmail);
            message.setSubject("EduFinance: Daily Financial Summary (" + LocalDate.now() + ")");
            
            // Constructing a clean, professional email body
            String emailBody = String.format("""
                    Hello Admin,
                    
                    Here is the End-of-Day Financial Summary for %s:
                    
                    ----------------------------------------
                    Total Income:   ₹ %,.2f
                    Total Expenses: ₹ %,.2f
                    ----------------------------------------
                    NET BALANCE:    ₹ %,.2f
                    ----------------------------------------
                    
                    You have %d recent transactions logged today. 
                    Please log in to the EduFinance Dashboard for full details.
                    
                    Regards,
                    EduFinance Automated System
                    """, 
                    LocalDate.now(), 
                    summary.totalIncome(), 
                    summary.totalExpense(), 
                    summary.netBalance(),
                    summary.recentTransactions().size()
            );

            message.setText(emailBody);
            mailSender.send(message);
            log.info("Email sent successfully!");

        } catch (Exception e) {
            log.error("Failed to send email summary: {}", e.getMessage());
        }
    }
}

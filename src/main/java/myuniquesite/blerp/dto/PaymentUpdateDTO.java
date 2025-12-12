package myuniquesite.blerp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentUpdateDTO {
    private String customerName;

    private Integer customerId; // Can be changed to link payment to a different customer

    private BigDecimal amount;

    private BigDecimal balance;

    private String method;

    private String status; // "FULL_BALANCE", "PARTIALY", "FULLY_PAID"

    @com.fasterxml.jackson.annotation.JsonAlias("amount_date")
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime amountDate; // Payment amount date

    @com.fasterxml.jackson.annotation.JsonAlias("pay_date")
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime payDate; // Payment date

    private String fname;
    private String lname;

    // Getters and Setters

    public String getFname() {
        return fname;
    }

    public void setFname(String fname) {
        this.fname = fname;
    }

    public String getLname() {
        return lname;
    }

    public void setLname(String lname) {
        this.lname = lname;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAmountDate() {
        return amountDate;
    }

    public void setAmountDate(LocalDateTime amountDate) {
        this.amountDate = amountDate;
    }

    public LocalDateTime getPayDate() {
        return payDate;
    }

    public void setPayDate(LocalDateTime payDate) {
        this.payDate = payDate;
    }
}

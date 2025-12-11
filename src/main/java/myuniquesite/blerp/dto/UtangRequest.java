package myuniquesite.blerp.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class UtangRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    private Integer customerId; // Optional - if provided, use existing customer

    private BigDecimal amount; // Payment amount

    private BigDecimal balance; // Payment balance (defaults to amount if not provided)

    private String method; // Payment method (e.g., "credit")

    private String status; // Payment status (e.g., "FULL_BALANCE", "PARTIALY", "FULLY_PAID")

    // Getters and Setters

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
}


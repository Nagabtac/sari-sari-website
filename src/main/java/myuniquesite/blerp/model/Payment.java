package myuniquesite.blerp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer paymentId;

    @NotNull(message = "Customer ID is required")
    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "amount_date")
    private LocalDateTime amountDate;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance", precision = 10, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "pay_date")
    private LocalDateTime payDate;

    @NotNull(message = "Method is required")
    @Column(name = "method", nullable = false, length = 50)
    private String method;

    @Convert(converter = myuniquesite.blerp.converter.PaymentStatusConverter.class)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.FULL_BALANCE;

    // Enum for payment status
    public enum PaymentStatus {
        PARTIALY,  // Note: matches database enum value 'partialy'
        FULLY_PAID,
        FULL_BALANCE
    }

    // Getters and Setters

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public LocalDateTime getAmountDate() {
        return amountDate;
    }

    public void setAmountDate(LocalDateTime amountDate) {
        this.amountDate = amountDate;
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

    public LocalDateTime getPayDate() {
        return payDate;
    }

    public void setPayDate(LocalDateTime payDate) {
        this.payDate = payDate;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }
}


package myuniquesite.blerp.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments_archive")
public class PaymentArchive {

    @Id
    @Column(name = "payment_id")
    private Integer paymentId;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "amount_date")
    private LocalDateTime amountDate;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance", precision = 10, scale = 2)
    private BigDecimal balance;

    @Column(name = "pay_date")
    private LocalDateTime payDate;

    @Column(name = "method", nullable = false, length = 50)
    private String method;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "customer_name")
    private String customerName;

    // Constructors
    public PaymentArchive() {
    }

    public PaymentArchive(Payment payment, String customerName) {
        this.paymentId = payment.getPaymentId();
        this.customerId = payment.getCustomerId();
        this.amountDate = payment.getAmountDate();
        this.amount = payment.getAmount();
        this.balance = payment.getBalance();
        this.payDate = payment.getPayDate();
        this.method = payment.getMethod();
        this.status = payment.getStatus().name(); // Store enum name as string
        this.customerName = customerName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}

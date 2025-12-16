package myuniquesite.blerp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    @JsonProperty("transaction_id")
    private Integer transactionId;

    @Column(name = "customer_id")
    @JsonProperty("customer_id")
    private Integer customerId;

    @Column(name = "transaction_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("transaction_date")
    private LocalDateTime transactionDate;

    // Expected payment date (requested by user)
    @Column(name = "pay_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("pay_date")
    private LocalDateTime payDate;

    // For manual setting if needed, though DB default is CURRENT_TIMESTAMP
    // But JPA might need it explicitly if insertable=true.
    // User schema says DEFAULT CURRENT_TIMESTAMP.
    // Let's make it insertable so we can set it from frontend if needed, or default
    // it.

    @Column(name = "transaction_type", nullable = false, length = 50)
    @JsonProperty("transaction_type")
    private String transactionType;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 50)
    @JsonProperty("payment_method")
    private String paymentMethod;

    @Column(name = "status", length = 30)
    private String status = "PENDING";

    @Column(name = "remarks")
    private String remarks;

    // Transient fields for request handling (not stored in transactions table)
    @Transient
    private String fname;

    @Transient
    private String lname;

    // Join for customer name
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    // Getters and Setters
    public Integer getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Integer id) {
        this.transactionId = id;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer id) {
        this.customerId = id;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime date) {
        this.transactionDate = date;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String type) {
        this.transactionType = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String method) {
        this.paymentMethod = method;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    // Helper to get name
    public String getCustomerName() {
        return customer != null ? customer.getCustomerName() : null;
    }

    public LocalDateTime getPayDate() {
        return payDate;
    }

    public void setPayDate(LocalDateTime payDate) {
        this.payDate = payDate;
    }

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
}

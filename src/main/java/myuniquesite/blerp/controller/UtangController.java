package myuniquesite.blerp.controller;

import myuniquesite.blerp.model.Customer;
import myuniquesite.blerp.model.Payment;
import myuniquesite.blerp.dto.UtangRequest;
import myuniquesite.blerp.dto.PaymentUpdateDTO;
import myuniquesite.blerp.service.CustomerService;
import myuniquesite.blerp.service.PaymentService;
import myuniquesite.blerp.exception.ResourceNotFoundException;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // ✅ Allow requests from all origins (OK for dev)
public class UtangController {

    private final CustomerService customerService;
    private final PaymentService paymentService;

    @Autowired
    public UtangController(CustomerService customerService, PaymentService paymentService) {
        this.customerService = customerService;
        this.paymentService = paymentService;
    }

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Map<String, Object>> createUtang(@Valid @RequestBody UtangRequest request) {
        // Find or create customer
        Customer customer;
        if (request.getCustomerId() != null) {
            // Use existing customer if customer_id is provided
            customer = customerService.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer with ID " + request.getCustomerId() + " not found.",
                            request.getCustomerId().longValue()));
        } else if ((request.getFname() != null && !request.getFname().trim().isEmpty()) ||
                (request.getLname() != null && !request.getLname().trim().isEmpty()) ||
                (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty())) {

            // Determine name parts
            String fname = request.getFname();
            String lname = request.getLname();
            String fullName = request.getCustomerName();

            // If explicit fname/lname not provided, try to split customerName
            if ((fname == null || fname.trim().isEmpty()) && fullName != null) {
                String[] parts = fullName.trim().split("\\s+", 2);
                fname = parts[0];
                lname = parts.length > 1 ? parts[1] : fname; // Fallback: use fname as lname if single word
            }

            // Ensure we have values to avoid DB NotNull constraint
            if (fname == null || fname.trim().isEmpty())
                fname = "Unknown";
            if (lname == null || lname.trim().isEmpty())
                lname = fname; // Reuse fname if lname missing

            if (fullName == null || fullName.trim().isEmpty()) {
                fullName = fname + " " + lname;
            }

            // Check if customer with this name already exists (using full name check as
            // proxy, or ideally explicit search)
            // For now, simple check by customerName
            customer = customerService.findByCustomerName(fullName).orElse(null);

            if (customer == null) {
                // Create new customer if it doesn't exist
                customer = new Customer();
                customer.setFname(fname);
                customer.setLname(lname);
                customer.setCustomerName(fullName);
                customer = customerService.save(customer);
            }
        } else {
            throw new IllegalArgumentException("Customer details (Id or Name) must be provided");
        }

        // Create a new payment record for the Utang (credit)
        Payment payment = new Payment();
        payment.setCustomerId(customer.getCustomerId());

        // Set amountDate to now for graph tracking
        payment.setAmountDate(LocalDateTime.now());

        if (request.getPayDate() != null) {
            payment.setPayDate(request.getPayDate());
        }

        // Use amount from request, or default to 0.00
        payment.setAmount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO);

        // Use balance from request, or default to amount (or 0.00 if amount is also
        // null)
        if (request.getBalance() != null) {
            payment.setBalance(request.getBalance());
        } else if (request.getAmount() != null) {
            payment.setBalance(request.getAmount()); // Default balance to amount
        } else {
            payment.setBalance(BigDecimal.ZERO);
        }

        // Use method from request, or default to "credit"
        payment.setMethod(request.getMethod() != null && !request.getMethod().trim().isEmpty()
                ? request.getMethod()
                : "credit");

        // Convert status string to enum, or default to FULL_BALANCE
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            try {
                Payment.PaymentStatus status = Payment.PaymentStatus.valueOf(request.getStatus().toUpperCase());
                payment.setStatus(status);
            } catch (IllegalArgumentException e) {
                // Handle status mapping from frontend format
                switch (request.getStatus().toUpperCase()) {
                    case "FULLY PAID":
                    case "FULLY_PAID":
                        payment.setStatus(Payment.PaymentStatus.FULLY_PAID);
                        break;
                    case "PARTIALLY PAID":
                    case "PARTIALY":
                        payment.setStatus(Payment.PaymentStatus.PARTIALY);
                        break;
                    case "FULL BALANCE":
                    case "FULL_BALANCE":
                        payment.setStatus(Payment.PaymentStatus.FULL_BALANCE);
                        break;
                    default:
                        payment.setStatus(Payment.PaymentStatus.FULL_BALANCE);
                }
            }
        } else {
            payment.setStatus(Payment.PaymentStatus.FULL_BALANCE);
        }

        Payment savedPayment = paymentService.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Utang created successfully");
        response.put("customer", customer);
        response.put("payment", savedPayment);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/store-credit-list")
    public ResponseEntity<List<Map<String, Object>>> getStoreCreditList() {
        List<Payment> payments = paymentService.findAll();
        List<Map<String, Object>> responseList = new java.util.ArrayList<>();

        for (Payment payment : payments) {
            Map<String, Object> item = new HashMap<>();
            item.put("paymentId", payment.getPaymentId());
            item.put("customerId", payment.getCustomerId());
            item.put("amount", payment.getAmount());
            item.put("balance", payment.getBalance());
            item.put("amountDate", payment.getAmountDate());
            item.put("payDate", payment.getPayDate());
            item.put("method", payment.getMethod());
            item.put("status", payment.getStatus());

            // Fetch customer name
            String customerName = "Unknown";
            String fname = "";
            String lname = "";

            try {
                Customer customer = customerService.findById(payment.getCustomerId()).orElse(null);
                if (customer != null) {
                    customerName = customer.getCustomerName();
                    fname = customer.getFname();
                    lname = customer.getLname();
                }
            } catch (Exception e) {
                // Ignore errors fetching customer
            }
            item.put("customerName", customerName);
            item.put("fname", fname);
            item.put("lname", lname);

            responseList.add(item);
        }

        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/store-credit-list/{id}")
    public ResponseEntity<?> updatePayment(
            @PathVariable Integer id,
            @RequestBody PaymentUpdateDTO updateDTO) {

        try {
            // Find the payment record
            Payment payment = paymentService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Payment with ID " + id + " not found for update.", id.longValue()));

            // Handle customer update/change
            Customer customer;
            Integer targetCustomerId = updateDTO.getCustomerId() != null
                    ? updateDTO.getCustomerId()
                    : payment.getCustomerId(); // Use provided customerId or keep existing

            // Find the customer (either new or existing)
            customer = customerService.findById(targetCustomerId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer with ID " + targetCustomerId + " not found.",
                            targetCustomerId.longValue()));

            // Update customer name if provided (always update if customerName is sent)
            if (updateDTO.getCustomerName() != null && !updateDTO.getCustomerName().trim().isEmpty()) {
                customer.setCustomerName(updateDTO.getCustomerName());
            }

            if (updateDTO.getFname() != null && !updateDTO.getFname().trim().isEmpty()) {
                customer.setFname(updateDTO.getFname());
            }

            if (updateDTO.getLname() != null && !updateDTO.getLname().trim().isEmpty()) {
                customer.setLname(updateDTO.getLname());
            }

            customer = customerService.save(customer);

            // Update payment fields - update all provided fields
            payment.setCustomerId(customer.getCustomerId());

            // Update amount if provided
            if (updateDTO.getAmount() != null) {
                payment.setAmount(updateDTO.getAmount());
            }

            // Update balance if provided
            if (updateDTO.getBalance() != null) {
                payment.setBalance(updateDTO.getBalance());
            }

            // Update method if provided
            if (updateDTO.getMethod() != null && !updateDTO.getMethod().trim().isEmpty()) {
                payment.setMethod(updateDTO.getMethod());
            }

            // Update amount_date if provided
            if (updateDTO.getAmountDate() != null) {
                payment.setAmountDate(updateDTO.getAmountDate());
            }

            // Update pay_date if provided
            if (updateDTO.getPayDate() != null) {
                payment.setPayDate(updateDTO.getPayDate());
            }

            // Convert status string to enum
            if (updateDTO.getStatus() != null) {
                try {
                    Payment.PaymentStatus status = Payment.PaymentStatus.valueOf(updateDTO.getStatus());
                    payment.setStatus(status);
                } catch (IllegalArgumentException e) {
                    // Handle status mapping from frontend format
                    switch (updateDTO.getStatus().toUpperCase()) {
                        case "FULLY PAID":
                        case "FULLY_PAID":
                            payment.setStatus(Payment.PaymentStatus.FULLY_PAID);
                            break;
                        case "PARTIALLY PAID":
                        case "PARTIALY":
                            payment.setStatus(Payment.PaymentStatus.PARTIALY);
                            break;
                        case "FULL BALANCE":
                        case "FULL_BALANCE":
                            payment.setStatus(Payment.PaymentStatus.FULL_BALANCE);
                            break;
                        default:
                            payment.setStatus(Payment.PaymentStatus.FULL_BALANCE);
                    }
                }
            }

            Payment updatedPayment = paymentService.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment updated successfully");
            response.put("customer", customer);
            response.put("payment", updatedPayment);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Collections.singletonMap("error", "Update failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/store-credit-list/{id}")
    public ResponseEntity<Map<String, String>> deletePayment(@PathVariable Integer id) {
        // Verify payment exists before attempting to delete
        paymentService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment with ID " + id + " not found for delete.", id.longValue()));

        try {
            paymentService.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Handle foreign key constraint violations or other database errors
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete payment: " + e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("foreign key")) {
                error.put("error", "Cannot delete payment due to foreign key constraints");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/store-credit-list/{id}/archive")
    public ResponseEntity<Map<String, String>> archivePayment(@PathVariable Integer id) {
        try {
            paymentService.archivePayment(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment archived successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to archive payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/archive/payments/{id}/restore")
    public ResponseEntity<?> restorePayment(@PathVariable Integer id) {
        try {
            paymentService.unarchivePayment(id);
            return ResponseEntity.ok().build();
        } catch (Throwable e) {
            e.printStackTrace(); // Ensure it's logged on server too
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Collections.singletonMap("message", "Restore failed: " + e.toString()));
        }
    }

    @DeleteMapping("/archive/payments/{id}")
    public ResponseEntity<?> deleteArchivedPayment(@PathVariable Integer id) {
        try {
            paymentService.deleteArchivedPayment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Collections.singletonMap("message", "Delete failed: " + e.toString()));
        }
    }

    @GetMapping("/archive/payments")
    public ResponseEntity<List<myuniquesite.blerp.model.PaymentArchive>> getArchivedPayments() {
        return ResponseEntity.ok(paymentService.findAllArchived());
    }
}

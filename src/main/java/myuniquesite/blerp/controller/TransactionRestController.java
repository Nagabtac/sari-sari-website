package myuniquesite.blerp.controller;

import myuniquesite.blerp.model.Transaction;
import myuniquesite.blerp.service.TransactionService;
import myuniquesite.blerp.exception.ResourceNotFoundException;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionRestController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionRestController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Integer id) {
        Transaction transaction = transactionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction with ID " + id + " not found.",
                        id.longValue()));
        return ResponseEntity.ok(transaction);
    }

    @Autowired
    private myuniquesite.blerp.service.CustomerService customerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction createTransaction(@Valid @RequestBody Transaction transaction) {
        // Handle Customer Creation/Lookup if fname/lname provided and customerId is
        // missing
        if (transaction.getCustomerId() == null &&
                (transaction.getFname() != null || transaction.getLname() != null)) {

            String fname = transaction.getFname() != null ? transaction.getFname().trim() : "";
            String lname = transaction.getLname() != null ? transaction.getLname().trim() : "";

            if (fname.isEmpty())
                fname = "Guest";
            if (lname.isEmpty())
                lname = "Customer";

            String fullName = fname + " " + lname;

            // Check if customer exists by name (simple check)
            // Ideally we should have better matching, but this aligns with UtangController
            myuniquesite.blerp.model.Customer customer = customerService.findByCustomerName(fullName).orElse(null);

            if (customer == null) {
                customer = new myuniquesite.blerp.model.Customer();
                customer.setFname(fname);
                customer.setLname(lname);
                customer.setCustomerName(fullName);
                customer = customerService.save(customer);
            }

            transaction.setCustomerId(customer.getCustomerId());
        }

        return transactionService.save(transaction);
    }

    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Integer id, @Valid @RequestBody Transaction txnDetails) {
        Transaction transaction = transactionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction with ID " + id + " not found for update.",
                        id.longValue()));

        transaction.setAmount(txnDetails.getAmount());
        transaction.setTransactionDate(txnDetails.getTransactionDate());
        transaction.setTransactionType(txnDetails.getTransactionType());
        transaction.setPaymentMethod(txnDetails.getPaymentMethod());
        transaction.setStatus(txnDetails.getStatus());
        transaction.setRemarks(txnDetails.getRemarks());

        if (txnDetails.getCustomerId() != null) {
            transaction.setCustomerId(txnDetails.getCustomerId());
        }

        return transactionService.save(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Integer id) {
        transactionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction with ID " + id + " not found for delete.",
                        id.longValue()));

        transactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

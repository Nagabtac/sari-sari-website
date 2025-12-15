package myuniquesite.blerp.service;

import myuniquesite.blerp.model.Payment;
import myuniquesite.blerp.repository.PaymentRepository;
import myuniquesite.blerp.model.PaymentArchive;
import myuniquesite.blerp.model.Customer;
import myuniquesite.blerp.repository.PaymentArchiveRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentArchiveRepository paymentArchiveRepository;

    @Autowired
    private CustomerService customerService;

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> findById(Integer id) {
        return paymentRepository.findById(id);
    }

    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    public void deleteById(Integer id) {
        paymentRepository.deleteById(id);
    }

    public List<Payment> findByCustomerId(Integer customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }

    @Transactional
    public void archivePayment(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id " + id));

        String customerName = "Unknown";
        try {
            Customer customer = customerService.findById(payment.getCustomerId()).orElse(null);
            if (customer != null) {
                customerName = customer.getCustomerName();
            }
        } catch (Exception e) {
            // Use default if customer fetch fails
        }

        PaymentArchive archive = new PaymentArchive(payment, customerName);
        paymentArchiveRepository.save(archive);
        paymentRepository.deleteById(id);
    }

    public List<PaymentArchive> findAllArchived() {
        return paymentArchiveRepository.findAll();
    }

    @Transactional
    public void unarchivePayment(Integer id) {
        try {
            PaymentArchive archive = paymentArchiveRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Archived payment not found with id " + id));

            // Check if customer exists by ID
            Customer customer = customerService.findById(archive.getCustomerId()).orElse(null);

            // If not found by ID, try finding by Name (safely taking the first match)
            if (customer == null && archive.getCustomerName() != null) {
                customer = customerService.findFirstByCustomerName(archive.getCustomerName()).orElse(null);
            }

            if (customer == null) {
                // Recreate customer
                customer = new Customer();
                // Try to split name if available
                String fullName = archive.getCustomerName();
                if (fullName == null || fullName.trim().isEmpty()) {
                    fullName = "Unknown Restored";
                }

                // Truncate customerName to 100 chars (Customer entity limit)
                if (fullName.length() > 100)
                    fullName = fullName.substring(0, 100);
                customer.setCustomerName(fullName);

                String[] parts = fullName.trim().split("\\s+", 2);
                String fname = parts[0];
                String lname = parts.length > 1 ? parts[1] : parts[0];

                // Truncate fname/lname to 50 chars (Customer entity limit)
                if (fname.length() > 50)
                    fname = fname.substring(0, 50);
                if (lname.length() > 50)
                    lname = lname.substring(0, 50);

                customer.setFname(fname);
                customer.setLname(lname);

                customer = customerService.save(customer);
            }

            Payment payment = new Payment();
            // Allow DB to generate new ID or use existing if strategy allows.

            payment.setCustomerId(customer.getCustomerId()); // Use possibly new customer ID
            payment.setAmountDate(archive.getAmountDate());
            payment.setAmount(archive.getAmount());
            payment.setBalance(archive.getBalance());
            payment.setPayDate(archive.getPayDate());
            payment.setMethod(archive.getMethod());

            // Convert status string back to enum (Handle case sensitivity)
            try {
                String statusStr = archive.getStatus();
                if (statusStr != null) {
                    payment.setStatus(Payment.PaymentStatus.valueOf(statusStr.toUpperCase()));
                } else {
                    payment.setStatus(Payment.PaymentStatus.FULL_BALANCE);
                }
            } catch (IllegalArgumentException e) {
                payment.setStatus(Payment.PaymentStatus.FULL_BALANCE); // Default
            }

            paymentRepository.save(payment);
            paymentArchiveRepository.deleteByPaymentId(id);
        } catch (Exception e) {
            e.printStackTrace(); // Log detailed error to console
            throw new RuntimeException("Error unarchiving payment: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteArchivedPayment(Integer id) {
        if (paymentArchiveRepository.existsById(id)) {
            paymentArchiveRepository.deleteByPaymentId(id);
        } else {
            throw new RuntimeException("Archived payment not found with id " + id);
        }
    }
}

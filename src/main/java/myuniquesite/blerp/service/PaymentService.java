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
}

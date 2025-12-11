package myuniquesite.blerp.service;

import myuniquesite.blerp.model.Customer;
import myuniquesite.blerp.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Optional<Customer> findById(Integer id) {
        return customerRepository.findById(id);
    }

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public void deleteById(Integer id) {
        customerRepository.deleteById(id);
    }

    public long count() {
        return customerRepository.count();
    }

    public Optional<Customer> findByCustomerName(String customerName) {
        return customerRepository.findByCustomerName(customerName);
    }
}


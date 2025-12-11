package myuniquesite.blerp.service;

import myuniquesite.blerp.model.Sale;
import myuniquesite.blerp.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Optional;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    public List<Sale> findAll() {
        return saleRepository.findAll();
    }

    public Optional<Sale> findById(Integer id) {
        return saleRepository.findById(id);
    }

    public Sale save(Sale sale) {
        return saleRepository.save(sale);
    }

    public void deleteById(Integer id) {
        saleRepository.deleteById(id);
    }

    public List<Sale> findBySaleDateBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        return saleRepository.findBySaleDateBetween(startDate, endDate);
    }
}


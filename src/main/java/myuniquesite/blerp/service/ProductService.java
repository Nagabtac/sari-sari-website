package myuniquesite.blerp.service;

import myuniquesite.blerp.model.Product;
import myuniquesite.blerp.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(Integer id) {
        return productRepository.findById(id);
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void deleteById(Integer id) {
        productRepository.deleteById(id);
    }

    public long count() {
        return productRepository.count();
    }

    public Optional<Product> findBySku(String sku) {
        return productRepository.findBySku(sku);
    }
}


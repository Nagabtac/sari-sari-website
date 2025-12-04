package myuniquesite.blerp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import myuniquesite.blerp.model.Product;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    Optional<Product> findBySku(String sku);
}


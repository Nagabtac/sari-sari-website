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

    @Autowired
    private myuniquesite.blerp.repository.ProductArchiveRepository productArchiveRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public List<myuniquesite.blerp.model.ProductArchive> findAllArchived() {
        return productArchiveRepository.findAll();
    }

    public Optional<Product> findById(Integer id) {
        return productRepository.findById(id);
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void deleteById(Integer id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            myuniquesite.blerp.model.ProductArchive archive = new myuniquesite.blerp.model.ProductArchive(product);
            productArchiveRepository.save(archive);
            productRepository.deleteById(id);
        } else {
            throw new RuntimeException("Product not found with id " + id);
        }
    }

    public void unarchive(Integer id) {
        Optional<myuniquesite.blerp.model.ProductArchive> archiveOpt = productArchiveRepository.findById(id);
        if (archiveOpt.isPresent()) {
            myuniquesite.blerp.model.ProductArchive archive = archiveOpt.get();
            Product product = new Product();
            // Do NOT set productId, let database generate a new one to avoid conflicts with
            // IDENTITY strategy
            // product.setProductId(archive.getProductId());

            product.setProductName(archive.getProductName());
            product.setSellingPrice(archive.getSellingPrice());
            product.setBasePrice(archive.getBasePrice());
            product.setQuantityInStock(archive.getQuantityInStock());
            product.setCategoryId(archive.getCategoryId());
            product.setSku(archive.getSku());
            product.setDescription(archive.getDescription());
            product.setSize(archive.getSize());

            productRepository.save(product);
            productArchiveRepository.deleteById(id);
        } else {
            throw new RuntimeException("Archived product not found with id " + id);
        }
    }

    public long count() {
        return productRepository.count();
    }

    public Optional<Product> findBySku(String sku) {
        return productRepository.findBySku(sku);
    }
}

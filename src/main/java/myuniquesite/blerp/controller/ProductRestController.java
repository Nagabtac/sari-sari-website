package myuniquesite.blerp.controller;

import myuniquesite.blerp.model.Product;
import myuniquesite.blerp.service.ProductService;
import myuniquesite.blerp.exception.ResourceNotFoundException;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // ✅ Allow requests from all origins (OK for dev)
public class ProductRestController {

    private final ProductService productService;

    @Autowired
    public ProductRestController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        Product product = productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + id + " not found.", id.longValue()));
        return ResponseEntity.ok(product);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(@Valid @RequestBody Product product) {
        return productService.save(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Integer id, @Valid @RequestBody Product productDetails) {
        Product product = productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + id + " not found for update.", id.longValue()));

        product.setProductName(productDetails.getProductName());
        product.setSellingPrice(productDetails.getSellingPrice());
        product.setBasePrice(productDetails.getBasePrice());
        product.setQuantityInStock(productDetails.getQuantityInStock());
        product.setCategoryId(productDetails.getCategoryId());
        product.setSku(productDetails.getSku());
        product.setDescription(productDetails.getDescription());

        return productService.save(product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + id + " not found for delete.", id.longValue()));

        productService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


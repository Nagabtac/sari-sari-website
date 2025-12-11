package myuniquesite.blerp.controller;

import myuniquesite.blerp.model.Sale;
import myuniquesite.blerp.service.SaleService;
import myuniquesite.blerp.exception.ResourceNotFoundException;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*") // ✅ Allow requests from all origins (OK for dev)
public class SaleRestController {

    private final SaleService saleService;

    @Autowired
    public SaleRestController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(@PathVariable Integer id) {
        Sale sale = saleService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale with ID " + id + " not found.", id.longValue()));
        return ResponseEntity.ok(sale);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sale createSale(@Valid @RequestBody Sale sale) {
        return saleService.save(sale);
    }

    @PutMapping("/{id}")
    public Sale updateSale(@PathVariable Integer id, @Valid @RequestBody Sale saleDetails) {
        Sale sale = saleService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale with ID " + id + " not found for update.", id.longValue()));

        sale.setSaleDate(saleDetails.getSaleDate());
        sale.setAmount(saleDetails.getAmount());

        return saleService.save(sale);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Integer id) {
        saleService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale with ID " + id + " not found for delete.", id.longValue()));

        saleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


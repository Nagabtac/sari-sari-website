package myuniquesite.blerp.repository;

import myuniquesite.blerp.model.ProductArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductArchiveRepository extends JpaRepository<ProductArchive, Integer> {
}

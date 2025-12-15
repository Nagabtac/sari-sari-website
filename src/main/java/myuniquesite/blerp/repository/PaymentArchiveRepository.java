package myuniquesite.blerp.repository;

import myuniquesite.blerp.model.PaymentArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentArchiveRepository extends JpaRepository<PaymentArchive, Integer> {
}

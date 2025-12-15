package myuniquesite.blerp.repository;

import myuniquesite.blerp.model.PaymentArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

@Repository
public interface PaymentArchiveRepository extends JpaRepository<PaymentArchive, Integer> {

    @Modifying
    @Transactional
    @Query("DELETE FROM PaymentArchive p WHERE p.paymentId = :id")
    void deleteByPaymentId(@Param("id") Integer id);
}

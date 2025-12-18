package myuniquesite.blerp.repository;

import myuniquesite.blerp.model.TransactionArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionArchiveRepository extends JpaRepository<TransactionArchive, Integer> {
}

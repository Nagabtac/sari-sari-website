package myuniquesite.blerp.service;

import myuniquesite.blerp.model.Transaction;
import myuniquesite.blerp.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final myuniquesite.blerp.repository.TransactionArchiveRepository transactionArchiveRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository,
            myuniquesite.blerp.repository.TransactionArchiveRepository transactionArchiveRepository) {
        this.transactionRepository = transactionRepository;
        this.transactionArchiveRepository = transactionArchiveRepository;
    }

    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    public Optional<Transaction> findById(Integer id) {
        return transactionRepository.findById(id);
    }

    public Transaction save(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public void deleteById(Integer id) {
        transactionRepository.deleteById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public void archiveTransaction(Integer id) {
        Transaction txn = findById(id)
                .orElseThrow(() -> new myuniquesite.blerp.exception.ResourceNotFoundException("Transaction not found",
                        id.longValue()));

        myuniquesite.blerp.model.TransactionArchive archive = new myuniquesite.blerp.model.TransactionArchive();
        archive.setTransactionId(txn.getTransactionId());
        archive.setCustomerId(txn.getCustomerId());
        archive.setTransactionDate(txn.getTransactionDate());
        archive.setTransactionType(txn.getTransactionType());
        archive.setAmount(txn.getAmount());
        archive.setPaymentMethod(txn.getPaymentMethod());
        archive.setStatus(txn.getStatus());
        archive.setRemarks(txn.getRemarks());
        archive.setPayDate(txn.getPayDate());

        // archivedAt is handled by DB default or we can set it if needed (but mapped as
        // insertable=false)

        transactionArchiveRepository.save(archive);
        transactionRepository.delete(txn);
    }

    @org.springframework.transaction.annotation.Transactional
    public void unarchiveTransaction(Integer archiveId) {
        myuniquesite.blerp.model.TransactionArchive archive = transactionArchiveRepository.findById(archiveId)
                .orElseThrow(() -> new myuniquesite.blerp.exception.ResourceNotFoundException(
                        "Archived transaction not found", archiveId.longValue()));

        // Native insert to preserve ID
        String sql = "INSERT INTO transactions (transaction_id, customer_id, transaction_date, transaction_type, amount, payment_method, status, remarks, pay_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        entityManager.createNativeQuery(sql)
                .setParameter(1, archive.getTransactionId())
                .setParameter(2, archive.getCustomerId())
                .setParameter(3, archive.getTransactionDate())
                .setParameter(4, archive.getTransactionType())
                .setParameter(5, archive.getAmount())
                .setParameter(6, archive.getPaymentMethod())
                .setParameter(7, archive.getStatus())
                .setParameter(8, archive.getRemarks())
                .setParameter(9, archive.getPayDate())
                .executeUpdate();

        transactionArchiveRepository.delete(archive);
    }

    public void deleteArchivedTransaction(Integer archiveId) {
        transactionArchiveRepository.deleteById(archiveId);
    }

    public List<myuniquesite.blerp.model.TransactionArchive> findAllArchived() {
        return transactionArchiveRepository.findAll();
    }
}

package com.wash.laundry_app.command;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CommandeRepository extends JpaRepository<Commande, Long> {

    boolean existsByClientId(Long clientId);


    // Find by numero_commande
    Optional<Commande> findByNumeroCommande(String numeroCommande);

    boolean existsByNumeroCommande(String numeroCommande);

    // Find by livreur
    List<Commande> findByLivreurId(Long livreurId);

    List<Commande> findByLivreurIdAndStatus(Long livreurId, CommandeStatus status);

    List<Commande> findByLivreurIdAndStatusIn(Long livreurId, List<CommandeStatus> statuses);

    long countByLivreurIdAndStatus(Long livreurId, CommandeStatus status);

    // Find by client
    List<Commande> findByClientId(Long clientId);


    // Find by status
    List<Commande> findByStatus(CommandeStatus status);

    List<Commande> findByStatusIn(List<CommandeStatus> statuses);

    // Find commandes ready for delivery (status = PRETE)
    @Query("SELECT c FROM Commande c WHERE c.status = 'PRETE' AND c.livreur.id = :livreurId")
    List<Commande> findReadyForDeliveryByLivreur(@Param("livreurId") Long livreurId);


    // Find commandes by date range
    List<Commande> findByDateCreationBetween(LocalDateTime start, LocalDateTime end);

    // Count commandes by status
    long countByStatus(CommandeStatus status);

    // Statistics queries
    @Query("SELECT COUNT(c) FROM Commande c WHERE DATE(c.dateCreation) = CURRENT_DATE")
    long countTodayCommandes();

    @Query("SELECT SUM(c.montantTotal) FROM Commande c WHERE c.status = 'PAYEE' AND DATE(c.datePaiement) = CURRENT_DATE")
    Double getTodayRevenue();

    // Additional useful statistics
    @Query("SELECT COUNT(c) FROM Commande c WHERE c.status = :status AND DATE(c.dateCreation) = CURRENT_DATE")
    long countTodayCommandesByStatus(@Param("status") CommandeStatus status);

    @Query("SELECT COUNT(c) FROM Commande c WHERE DATE(c.dateCreation) = :date")
    long countCommandesByDate(@Param("date") LocalDate date);

    @Query("SELECT SUM(c.montantTotal) FROM Commande c WHERE c.status = 'PAYEE' AND DATE(c.datePaiement) = :date")
    Double getRevenueByDate(@Param("date") LocalDate date);

    // Find commandes by livreur and date range
    List<Commande> findByLivreurIdAndDateCreationBetween(Long livreurId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT c FROM Commande c WHERE " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:dateDebut IS NULL OR c.dateCreation >= :dateDebut) AND " +
            "(:dateFin IS NULL OR c.dateCreation <= :dateFin) AND " +
            "(:search IS NULL OR LOWER(c.numeroCommande) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.client.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Commande> findFiltered(
            @Param("status") CommandeStatus status,
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin,
            @Param("search") String search,
            org.springframework.data.domain.Sort sort
    );
}



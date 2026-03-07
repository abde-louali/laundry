package com.wash.laundry_app.command;

import com.wash.laundry_app.clients.Client;
import com.wash.laundry_app.users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commandes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livreur_id", nullable = false)
    private User livreur;

    @Column(name = "numero_commande", unique = true, nullable = false, length = 50)
    private String numeroCommande;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommandeStatus status = CommandeStatus.en_attente;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "date_livraison")
    private LocalDateTime dateLivraison;

    @Column(name = "montant_total", precision = 10, scale = 2)
    private BigDecimal montantTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement")
    private ModePaiement modePaiement;

    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommandeTapis> commandeTapis = new ArrayList<>();


    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        dateCreation = LocalDateTime.now();

        // Auto-generate order number if not set
        if (numeroCommande == null) {
            numeroCommande = generateOrderNumber();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to generate order number
    private String generateOrderNumber() {
        return "CMD-" + LocalDateTime.now().getYear() + "-" + System.currentTimeMillis();
    }

    // Helper method to add tapis to order
    public void addTapis(CommandeTapis tapis) {
        commandeTapis.add(tapis);
        tapis.setCommande(this);
        recalculateTotal();
    }

    // Helper method to remove tapis from order
    public void removeTapis(CommandeTapis tapis) {
        commandeTapis.remove(tapis);
        tapis.setCommande(null);
        recalculateTotal();
    }

    // Recalculate total amount
    public void recalculateTotal() {
        this.montantTotal = commandeTapis.stream()
                .map(CommandeTapis::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
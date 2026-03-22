package com.wash.laundry_app.command;

import com.wash.laundry_app.users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "historique_statuts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriqueStatut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    @Column(name = "ancien_statut", length = 50)
    private String ancienStatut;

    @Column(name = "nouveau_statut", nullable = false, length = 50)
    private String nouveauStatut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit Getters/Setters to bypass Lombok failures
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Commande getCommande() { return commande; }
    public void setCommande(Commande commande) { this.commande = commande; }
    public String getAncienStatut() { return ancienStatut; }
    public void setAncienStatut(String ancienStatut) { this.ancienStatut = ancienStatut; }
    public String getNouveauStatut() { return nouveauStatut; }
    public void setNouveauStatut(String nouveauStatut) { this.nouveauStatut = nouveauStatut; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
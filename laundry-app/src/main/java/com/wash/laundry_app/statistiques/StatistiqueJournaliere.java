package com.wash.laundry_app.statistiques;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "statistiques_journalieres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatistiqueJournaliere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(name = "nombre_commandes")
    private Integer nombreCommandes = 0;

    @Column(name = "revenus_total", precision = 10, scale = 2)
    private BigDecimal revenusTotal = BigDecimal.ZERO;

    @Column(name = "nombre_tapis_traites")
    private Integer nombreTapisTraites = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
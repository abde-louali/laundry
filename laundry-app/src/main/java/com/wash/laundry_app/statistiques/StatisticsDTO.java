package com.wash.laundry_app.statistiques;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StatisticsDTO {
    // Today's statistics
    private Long totalCommandesToday;
    private BigDecimal revenuesToday;
    private Long commandesEnAttente;
    private Long commandesValidees;
    private Long commandesEnTraitement;
    private Long commandesPretes;
    private Long commandesLivrees;
    private Long commandesPayees;

    // Overall statistics
    private Long totalCommandes;
    private BigDecimal totalRevenues;

    // By status
    private Map<String, Long> commandesByStatus;

    // Date range
    private LocalDate dateDebut;
    private LocalDate dateFin;
}

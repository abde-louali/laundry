package com.wash.laundry_app.statistiques;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatistiqueJournaliereDTO {

    private Long id;
    private LocalDate date;
    private Integer nombreCommandes;
    private BigDecimal revenusTotal;
    private Integer nombreTapisTraites;
}

package com.wash.laundry_app.users.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientStatisticsDto {
    private long totalClients;
    private long commandesCeMois;
    private long nouveauxCeMois;
    private double pourcentageNouveaux;
}

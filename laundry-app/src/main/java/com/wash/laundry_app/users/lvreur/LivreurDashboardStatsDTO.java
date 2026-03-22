package com.wash.laundry_app.users.lvreur;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LivreurDashboardStatsDTO {
    private long commandesPretesCount;      // status: livree (with livreur, ready for client)
    private long commandesARecupererCount;  // status: prete (at workshop)
    private long commandesAnnuleesCount;    // status: annulee
    private long missionsCount;             // total missions for today
}

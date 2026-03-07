package com.wash.laundry_app.users.admin;

import com.wash.laundry_app.command.CommandeStatus;

import lombok.Data;
import java.math.BigDecimal;


@Data
public class CommandSummaryDto {
    private Long id;
    private String numeroCommande;
    private CommandeStatus status;
    private BigDecimal montantTotal;


}

package com.wash.laundry_app.command;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCommandeStatusRequest {

    @NotNull(message = "Le nouveau statut est obligatoire")
    private CommandeStatus newStatus;

    private String commentaire;
}
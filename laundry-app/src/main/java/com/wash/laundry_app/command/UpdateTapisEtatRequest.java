package com.wash.laundry_app.command;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTapisEtatRequest {

    @NotNull(message = "Le nouvel état est obligatoire")
    private TapisEtat newEtat;
}

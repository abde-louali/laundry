package com.wash.laundry_app.clients;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
@Data
public class UpdateClientRequest {
    @Size(max = 255, message = "Le nom ne doit pas dépasser 255 caractères")
    private String name;

    @Size(max = 20, message = "Le téléphone ne doit pas dépasser 20 caractères")
    private String phone;

    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private String notes;
}

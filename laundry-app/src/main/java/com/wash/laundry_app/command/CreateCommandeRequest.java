package com.wash.laundry_app.command;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommandeRequest {

    @NotNull(message = "L'ID du client est obligatoire")
    private Long clientId;

    @NotEmpty(message = "Au moins un tapis est requis")
    @Valid
    private List<TapisItem> tapis;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TapisItem {

        @NotNull(message = "Le nom du tapis est obligatoire")
        private String nom;

        private String description;

        @NotNull(message = "Le prix unitaire est obligatoire")
        private java.math.BigDecimal prixUnitaire;

        @NotNull(message = "La quantité est obligatoire")
        private Integer quantite;

        // ✅ NEW: List of image URLs
        private List<String> imageUrls;

        // ✅ NEW: Index of the main image (optional, defaults to 0)
        private Integer mainImageIndex;
    }
}
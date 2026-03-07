package com.wash.laundry_app.tapis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TapisDTO {

    private Long id;
    private String nom;
    private String description;
    private BigDecimal prixUnitaire;
    private List<TapisImageDTO> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

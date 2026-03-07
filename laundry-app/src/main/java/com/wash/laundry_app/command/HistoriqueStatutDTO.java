package com.wash.laundry_app.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoriqueStatutDTO {

    private Long id;
    private String ancienStatut;
    private String nouveauStatut;
    private String userName;
    private String commentaire;
    private LocalDateTime createdAt;
}

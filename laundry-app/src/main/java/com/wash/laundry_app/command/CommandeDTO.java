package com.wash.laundry_app.command;


import com.wash.laundry_app.clients.ClientDto;
import com.wash.laundry_app.users.UserDto;
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
public class CommandeDTO {

    private Long id;
    private ClientDto client;
    private UserDto livreur;
    private String numeroCommande;
    private CommandeStatus status;
    private LocalDateTime dateCreation;
    private LocalDateTime dateValidation;
    private LocalDateTime dateLivraison;
    private BigDecimal montantTotal;
    private ModePaiement modePaiement;
    private LocalDateTime datePaiement;
    private List<CommandeTapisDTO> commandeTapis;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String preparateurName;
}
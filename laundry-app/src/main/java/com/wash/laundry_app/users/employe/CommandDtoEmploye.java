package com.wash.laundry_app.users.employe;

import com.wash.laundry_app.command.CommandeStatus;
import com.wash.laundry_app.users.UserDto;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommandDtoEmploye {
    private Long id;
    private UserDto livreur;
    private String numeroCommande;
    private CommandeStatus status;
    private LocalDateTime dateCreation;
    private LocalDateTime dateValidation;
    private LocalDateTime dateLivraison;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

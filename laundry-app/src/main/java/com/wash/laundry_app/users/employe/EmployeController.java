package com.wash.laundry_app.users.employe;

import com.wash.laundry_app.command.*;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/employe")
@AllArgsConstructor


public class EmployeController {

        private final EmployeService employeService;
        private final CommandeService commandeService;
        @GetMapping("/commandes")
        public ResponseEntity<List<CommandDtoEmploye>> allCommandes() {
            List<CommandDtoEmploye> commandes = employeService.getCommands();
            return ResponseEntity.ok(commandes);
        }

        @PatchMapping("/commandes/{id}/status")
        public ResponseEntity<CommandeDTO> updateStatus(
                @PathVariable Long id,
                @Valid @RequestBody UpdateCommandeStatusRequest request) {
            return ResponseEntity.ok(commandeService.updateStatus(id, request));
        }

    // Get commande details
    @GetMapping("/commandes/{id}")
    public ResponseEntity<CommandDetails> getCommande(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.getCommandeById(id));
    }
    // Update tapis etat
    @PatchMapping("/commandes/tapis/{id}/etat")
    public ResponseEntity<CommandeTapisDTO> updateTapisEtat(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTapisEtatRequest request) {
        return ResponseEntity.ok(commandeService.updateTapisEtat(id, request));
    }
}



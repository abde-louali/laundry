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
        private final com.wash.laundry_app.tapis.TapisService tapisService;
        private final com.wash.laundry_app.tapis.FileStorageService fileStorageService;

        @GetMapping("/commandes")
        public ResponseEntity<List<CommandDtoEmploye>> allCommandes() {
            List<CommandDtoEmploye> commandes = employeService.getCommands();
            return ResponseEntity.ok(commandes);
        }

        @GetMapping("/commandes/attente")
        public ResponseEntity<List<CommandDtoEmploye>> getPendingCommandes() {
            List<CommandDtoEmploye> commandes = employeService.getPendingCommands();
            return ResponseEntity.ok(commandes);
        }

        @GetMapping("/commandes/count/attente")
        public ResponseEntity<Long> getPendingCount() {
            return ResponseEntity.ok(commandeService.getCountByStatus(CommandeStatus.en_attente));
        }

        @GetMapping("/commandes/retournee")
        public ResponseEntity<List<CommandDtoEmploye>> getReturnedCommandes() {
            List<CommandDtoEmploye> commandes = employeService.getReturnedCommands();
            return ResponseEntity.ok(commandes);
        }

        @GetMapping("/commandes/count/retournee")
        public ResponseEntity<Long> getReturnedCount() {
            return ResponseEntity.ok(commandeService.getCountByStatus(CommandeStatus.retournee));
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
        return ResponseEntity.ok(commandeService.updateTapisEtat(id, request));}
    @PostMapping("/commandes/tapis/{id}/images")
    public ResponseEntity<com.wash.laundry_app.tapis.TapisDTO> addTapisImages(
            @PathVariable Long id,
            @Valid @RequestBody com.wash.laundry_app.tapis.AddTapisImagesRequest request) {
        return ResponseEntity.ok(tapisService.addImages(id, request.getImageUrls(), request.getType()));
    }

    @PostMapping("/tapis/upload")
    public ResponseEntity<List<java.util.Map<String, String>>> uploadTapisImages(@RequestParam("files") org.springframework.web.multipart.MultipartFile[] files) {
        List<java.util.Map<String, String>> result = java.util.Arrays.stream(files).map(file -> {
            String fileName = fileStorageService.storeFile(file);
            String fileDownloadUri = "/uploads/" + fileName;
            return java.util.Map.of("imageUrl", fileDownloadUri);
        }).toList();
        return ResponseEntity.ok(result);
    }
}



package com.wash.laundry_app.users.lvreur;

import com.wash.laundry_app.auth.AuthService;
import com.wash.laundry_app.clients.ClientDto;
import com.wash.laundry_app.clients.ClientRegisterRequest;
import com.wash.laundry_app.clients.ClientSearchResponse;
import com.wash.laundry_app.command.*;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/livreur")
@AllArgsConstructor
public class LivreurController {

    private final CommandeService commandeService;
    private final LivreurService livreurService;
    private final AuthService authService;

    // ========== CLIENT MANAGEMENT ==========

    //  Get my pending client
    @GetMapping("/my-client/pending")
    public ResponseEntity<ClientDto> getMyPendingClient() {
        Optional<ClientDto> client = livreurService.getMyPendingClient();
        return client
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    //  Search client by phone
    @GetMapping("/clients/search")
    public ResponseEntity<ClientSearchResponse> searchByPhone(@RequestParam String phone) {
        Optional<ClientDto> client = livreurService.findByPhone(phone);
        return client
                .map(clientDto -> ResponseEntity.ok(new ClientSearchResponse(true, clientDto)))
                .orElseGet(() -> ResponseEntity.ok(new ClientSearchResponse(false, null)));
    }

    // Create new client
    @PostMapping("/clients")
    public ResponseEntity<ClientDto> createClient(@Valid @RequestBody ClientRegisterRequest request) {
        ClientDto client = livreurService.createClient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(client);
    }

    //  Delete pending client (optional - you decide if livreur can delete)
    @DeleteMapping("/clients/{id}")
    public ResponseEntity<Map<String, String>> deletePendingClient(@PathVariable Long id) {
        livreurService.deletePendingClient(id);
        return ResponseEntity.ok(Map.of("message", "Client supprimé avec succès"));
    }

    // ========== ORDER MANAGEMENT ==========

    //  Create order
    @PostMapping("/commandes")
    public ResponseEntity<CommandeDTO> createCommande(@Valid @RequestBody CreateCommandeRequest request) {
        CommandeDTO commande = commandeService.createCommande(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(commande);
    }

    // Get orders ready for delivery (status = PRETE)
    @GetMapping("/commandes/ready-for-delivery")
    public ResponseEntity<List<CommandeDTO>> getReadyForDelivery() {
        List<CommandeDTO> commandes = commandeService.getReadyForDeliveryByLivreur();
        return ResponseEntity.ok(commandes);
    }

    //  Record payment (change LIVREE → PAYEE)
    @PostMapping("/commandes/{id}/payment")
    public ResponseEntity<CommandeDTO> recordPayment(
            @PathVariable Long id,
            @Valid @RequestBody RecordPaymentRequest request) {
        CommandeDTO commande = commandeService.recordPayment(id, request);
        return ResponseEntity.ok(commande);
    }

}
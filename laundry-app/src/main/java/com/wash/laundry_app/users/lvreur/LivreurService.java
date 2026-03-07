package com.wash.laundry_app.users.lvreur;

import com.wash.laundry_app.auth.AuthService;
import com.wash.laundry_app.clients.*;
import com.wash.laundry_app.command.CommandeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@AllArgsConstructor
public class LivreurService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;
    private final AuthService authService;
    private final CommandeRepository commandeRepository;

    // Find pending client
    public Optional<ClientDto> getMyPendingClient() {
        var user = authService.currentUser();
        return clientRepository.findPendingClientByLivreur(user.getId())
                .map(clientMapper::toDto);
    }

    // Create new client
    @Transactional
    public ClientDto createClient(ClientRegisterRequest request) {
        var user = authService.currentUser();

        if (clientRepository.existsByPhone(request.getPhone())) {
            throw new ClientExistException("Un client avec ce numéro existe déjà");
        }

        Optional<Client> pendingClient = clientRepository.findPendingClientByLivreur(user.getId());

        if (pendingClient.isPresent()) {
            throw new PendingClientExistsException(
                    "Vous avez déjà un client en attente: " + pendingClient.get().getName() +
                            ". Créez une commande pour ce client avant d'en ajouter un nouveau."
            );
        }

        Client newClient = clientMapper.toEntity(request);
        newClient.setCreatedByLivreur(user);
        newClient = clientRepository.save(newClient);

        return clientMapper.toDto(newClient);
    }

    // Search by phone
    public Optional<ClientDto> findByPhone(String phone) {
        return clientRepository.findByPhone(phone)
                .map(clientMapper::toDto);
    }

    // Delete client (only if no orders)
    @Transactional
    public void deletePendingClient(Long clientId) {
        var user = authService.currentUser();
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException("Client non trouvé"));

        // Check ownership
        if (!client.getCreatedByLivreur().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("Vous ne pouvez pas supprimer ce client");
        }

        // Check if has orders
        if (commandeRepository.existsByClientId(clientId)) {
            throw new ForbiddenOperationException("Ce client a déjà des commandes");
        }

        clientRepository.delete(client);
    }
}
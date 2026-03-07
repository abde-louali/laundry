package com.wash.laundry_app.command;


import com.wash.laundry_app.auth.AuthService;
import com.wash.laundry_app.clients.Client;
import com.wash.laundry_app.clients.ClientNotFoundException;
import com.wash.laundry_app.clients.ClientRepository;
import com.wash.laundry_app.clients.ForbiddenOperationException;
import com.wash.laundry_app.tapis.Tapis;
import com.wash.laundry_app.tapis.TapisRepository;
import com.wash.laundry_app.users.User;
import com.wash.laundry_app.users.employe.CommandDetails;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final CommandeTapisRepository commandeTapisRepository;
    private final ClientRepository clientRepository;
    private final TapisRepository tapisRepository;
    private final HistoriqueStatutRepository historiqueStatutRepository;
    private final CommandeMapper commandeMapper;
    private final AuthService authService;
    private final CommandeTapisMapper commandeTapisMapper;
    private final HistoriqueStatutMapper historiqueStatutMapper;

    // Create commande

    @Transactional
    public CommandeDTO createCommande(CreateCommandeRequest request) {
        var livreur = authService.currentUser();

        // 1. Find client
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ClientNotFoundException("Client non trouvé"));

        // 2. Create commande
        Commande commande = new Commande();
        commande.setClient(client);
        commande.setLivreur(livreur);
        commande.setStatus(CommandeStatus.en_attente);
        commande = commandeRepository.save(commande);

        BigDecimal total = BigDecimal.ZERO;

        // 3. Create each tapis with images and link to order
        for (CreateCommandeRequest.TapisItem tapisItem : request.getTapis()) {

            // Create tapis record
            Tapis tapis = new Tapis();
            tapis.setNom(tapisItem.getNom());
            tapis.setDescription(tapisItem.getDescription());
            tapis.setPrixUnitaire(tapisItem.getPrixUnitaire());
            tapis = tapisRepository.save(tapis);

            // ✅ ADD IMAGES if provided
            if (tapisItem.getImageUrls() != null && !tapisItem.getImageUrls().isEmpty()) {
                int mainIndex = tapisItem.getMainImageIndex() != null ? tapisItem.getMainImageIndex() : 0;

                for (int i = 0; i < tapisItem.getImageUrls().size(); i++) {
                    String imageUrl = tapisItem.getImageUrls().get(i);
                    boolean isMain = (i == mainIndex);
                    tapis.addImage(imageUrl, isMain);
                }

                // Save tapis again to persist images
                tapis = tapisRepository.save(tapis);
            }

            // Create commande_tapis (junction)
            CommandeTapis commandeTapis = new CommandeTapis();
            commandeTapis.setCommande(commande);
            commandeTapis.setTapis(tapis);
            commandeTapis.setQuantite(tapisItem.getQuantite());
            commandeTapis.setPrixUnitaire(tapisItem.getPrixUnitaire());

            // Calculate subtotal
            BigDecimal sousTotal = tapisItem.getPrixUnitaire()
                    .multiply(new BigDecimal(tapisItem.getQuantite()));
            commandeTapis.setSousTotal(sousTotal);
            commandeTapis.setEtat(TapisEtat.en_attente);

            commandeTapisRepository.save(commandeTapis);

            // Add to total
            total = total.add(sousTotal);
        }

        // 4. Update commande total
        commande.setMontantTotal(total);
        commande = commandeRepository.save(commande);

        // 5. Record status history
        recordStatusChange(commande, null, CommandeStatus.en_attente.name(), livreur, "Commande créée");

        return commandeMapper.toDto(commande);
    }

    private void recordStatusChange(Commande commande, String oldStatus, String newStatus,
                                    com.wash.laundry_app.users.User user, String commentaire) {
        HistoriqueStatut historique = new HistoriqueStatut();
        historique.setCommande(commande);
        historique.setAncienStatut(oldStatus);
        historique.setNouveauStatut(newStatus);
        historique.setUser(user);
        historique.setCommentaire(commentaire);
        historiqueStatutRepository.save(historique);
    }


    // Get commande by ID
    public CommandDetails getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(CommandeNotFoundException::new);
        return commandeMapper.Todto(commande);
    }

    // Get all commandes
    public List<CommandeDTO> getAllCommandes() {
        return commandeRepository.findAll()
                .stream()
                .map(commandeMapper::toDto)
                .toList();
    }

    // Get commandes by livreur
    public List<CommandeDTO> getCommandesByLivreur(Long livreurId) {
        return commandeRepository.findByLivreurId(livreurId)
                .stream()
                .map(commandeMapper::toDto)
                .toList();
    }

    // Get commandes ready for delivery
    public List<CommandeDTO> getReadyForDelivery() {
        var user = authService.currentUser();
        return commandeRepository.findReadyForDeliveryByLivreur(user.getId())
                .stream()
                .map(commandeMapper::toDto)
                .toList();
    }

    // Get commandes by status
    public List<CommandeDTO> getCommandesByStatus(CommandeStatus status) {
        return commandeRepository.findByStatus(status)
                .stream()
                .map(commandeMapper::toDto)
                .toList();
    }

    // Update commande status
    @Transactional
    public CommandeDTO updateStatus(Long commandeId, UpdateCommandeStatusRequest request) {
        User currentUser = authService.currentUser();

        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(CommandeNotFoundException::new);

        String oldStatus = commande.getStatus().name();
        commande.setStatus(request.getNewStatus());

        // Update timestamps based on status
        switch (request.getNewStatus()) {
            case validee:
                commande.setDateValidation(LocalDateTime.now());
                break;
            case livree:
                commande.setDateLivraison(LocalDateTime.now());
                break;
        }

        commande = commandeRepository.save(commande);

        // Record status change
        recordStatusChange(commande, oldStatus, request.getNewStatus().name(), currentUser, request.getCommentaire());

        return commandeMapper.toDto(commande);
    }

    // Update tapis etat in commande
    @Transactional
    public CommandeTapisDTO updateTapisEtat(Long commandeTapisId, UpdateTapisEtatRequest request) {
        CommandeTapis commandeTapis = commandeTapisRepository.findById(commandeTapisId)
                .orElseThrow(() -> new RuntimeException("Tapis dans commande non trouvé"));

        commandeTapis.setEtat(request.getNewEtat());
        commandeTapis = commandeTapisRepository.save(commandeTapis);

        // Check if all tapis are done, update commande status
        checkAndUpdateCommandeStatusBasedOnTapis(commandeTapis.getCommande().getId());

        return commandeTapisMapper.toDto(commandeTapis);
    }

    // Record payment
    @Transactional
    public CommandeDTO recordPayment(Long commandeId, RecordPaymentRequest request) {
        User currentUser = authService.currentUser();

        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(CommandeNotFoundException::new);

        if (commande.getStatus() != CommandeStatus.livree) {
            throw new ForbiddenOperationException("error");
        }

        String oldStatus = commande.getStatus().name();
        commande.setModePaiement(request.getModePaiement());
        commande.setDatePaiement(LocalDateTime.now());
        commande.setStatus(CommandeStatus.payee);

        // Update all tapis to LIVRE
        for (CommandeTapis ct : commande.getCommandeTapis()) {
            ct.setEtat(TapisEtat.livre);
        }

        commande = commandeRepository.save(commande);

        // Record status change
        recordStatusChange(commande, oldStatus, CommandeStatus.payee.name(), currentUser, "Paiement enregistré");

        return commandeMapper.toDto(commande);
    }

    // Get historique for commande
    public List<HistoriqueStatutDTO> getHistorique(Long commandeId) {
        return historiqueStatutRepository.findByCommandeIdOrderByCreatedAtDesc(commandeId)
                .stream()
                .map(historiqueStatutMapper::toDto)
                .toList();
    }

    // Helper: Check if all tapis are cleaned, update commande status
    private void checkAndUpdateCommandeStatusBasedOnTapis(Long commandeId) {
        List<CommandeTapis> allTapis = commandeTapisRepository.findByCommandeId(commandeId);

        boolean allCleaned = allTapis.stream()
                .allMatch(ct -> ct.getEtat() == TapisEtat.nettoye);

        if (allCleaned) {
            Commande commande = commandeRepository.findById(commandeId).orElseThrow();
            if (commande.getStatus() == CommandeStatus.en_attente || commande.getStatus() == CommandeStatus.en_traitement  ) {
                commande.setStatus(CommandeStatus.prete);
                commandeRepository.save(commande);
            }
        }
    }

    public List<CommandeDTO> getReadyForDeliveryByLivreur() {
        return commandeRepository.findByStatus(CommandeStatus.livree)
                .stream()
                .map(commandeMapper::toDto)
                .toList();
    }
}

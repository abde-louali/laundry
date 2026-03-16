package com.wash.laundry_app.users.admin;

import com.wash.laundry_app.clients.ClientDto;
import com.wash.laundry_app.clients.ClientMapper;
import com.wash.laundry_app.clients.ClientNotFoundException;
import com.wash.laundry_app.clients.ClientRepository;
import com.wash.laundry_app.clients.Client;
import com.wash.laundry_app.command.*;
import com.wash.laundry_app.users.*;
import com.wash.laundry_app.users.employe.CommandDetails;
import com.wash.laundry_app.users.employe.CommandDtoEmploye;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
@AllArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CommandeRepository commandeRepository;
    private final CommandeMapper commandeMapper;
    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    // create a new user
    public ResponseEntity<UserDto> createUser(UserRegisterRequest request, UriComponentsBuilder uriBuilder){
        userRepository.existsByEmail(request.getEmail()).orElseThrow(InvalidCredintialsException::new);
        var user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.livreur);
        userRepository.save(user);
        var userDto = userMapper.toDto(user);
        var uri = uriBuilder.path("/users/{id}").buildAndExpand(userDto.getId()).toUri();
        return ResponseEntity.created(uri).body(userDto);
    }
// update user information
    public UserDto updateUser( Long id, UpdateUserRequest request){
        var user = userRepository.findById(id).orElseThrow(UserNotFoundException::new);

        userMapper.updateUser(request,user);
        userRepository.save(user);
        return userMapper.toDto(user);

    }
// get a single user
    public UserDto getSingleUser(Long id ){
        var user =  userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        return userMapper.toDto(user);
    }
// get all active user
    public List<UserDto> getAllActiveUsers(){
        return userRepository.findAllActive().stream().map(userMapper::toDto).toList();
    }
// get all non active users
    public List<UserDto> getAllInActiveUsers(){
        return userRepository.findAllInActive().stream().map(userMapper::toDto).toList();
    }
// inactive a user
    public void inActive(Long id){
        var user =  userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        if(user.getRole() == Role.admin){
            throw new ForbiddenAdminErrorsException("e");
        }
        user.setIsActive(false);
        userRepository.save(user);
    }
// activate a user
    public void activateUser(Long id){
        var user =  userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        if(user.getRole() == Role.admin){
            throw new ForbiddenAdminErrorsException("e");
        }
        user.setIsActive(true);
        userRepository.save(user);
    }
//  delete a user
    public void deleteUser(Long id){
        var user = userRepository.findById(id).orElseThrow(UserNotFoundException::new);
        if(user.getRole() == Role.admin || user.getIsActive()){
            throw new ForbiddenAdminErrorsException("e");
        }
        userRepository.delete(user);
    }
//    get all commandes
    public List<CommandSummaryDto> getCommands(){
        return commandeRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Commande::getDateCreation).reversed())
                .map(commandeMapper::TodTo).toList();
    }

    // get filtered commandes
    public List<CommandSummaryDto> getFilteredCommands(String status, java.time.LocalDate dateDebut, java.time.LocalDate dateFin, String search, Integer limit, String sortDirection) {
        var list = commandeRepository.findAll();
        
        if (status != null && !status.trim().isEmpty()) {
            list = list.stream().filter(c -> c.getStatus().name().equalsIgnoreCase(status)).toList();
        }
        if (dateDebut != null) {
            list = list.stream().filter(c -> c.getDateCreation() != null && !c.getDateCreation().toLocalDate().isBefore(dateDebut)).toList();
        }
        if (dateFin != null) {
            list = list.stream().filter(c -> c.getDateCreation() != null && !c.getDateCreation().toLocalDate().isAfter(dateFin)).toList();
        }
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            list = list.stream()
                .filter(c -> (c.getNumeroCommande() != null && c.getNumeroCommande().toLowerCase().contains(lowerSearch)) ||
                             (c.getClient() != null && c.getClient().getName() != null && c.getClient().getName().toLowerCase().contains(lowerSearch)))
                .toList();
        }
        
        if ("asc".equalsIgnoreCase(sortDirection)) {
            list = list.stream().sorted(java.util.Comparator.comparing(Commande::getDateCreation)).toList();
        } else {
             list = list.stream().sorted(java.util.Comparator.comparing(Commande::getDateCreation).reversed()).toList();
        }
        
        if (limit != null && limit > 0) {
            list = list.stream().limit(limit).toList();
        }
        
        return list.stream().map(commandeMapper::TodTo).toList();
    }

    // export commandes to CSV
    public byte[] exportCommandesToCsv() {
        List<Commande> commandes = commandeRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Commande::getDateCreation).reversed())
                .toList();
                
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Numero Commande,Client,Telephone,Date Creation,Status,Montant Total,Type Paiement\n");
        
        for (Commande c : commandes) {
            sb.append(c.getId()).append(",");
            sb.append(c.getNumeroCommande() != null ? c.getNumeroCommande() : "").append(",");
            sb.append(c.getClient() != null && c.getClient().getName() != null ? c.getClient().getName().replace(",", " ") : "").append(",");
            String phone = (c.getClient() != null && c.getClient().getPhones() != null && !c.getClient().getPhones().isEmpty()) 
                    ? c.getClient().getPhones().get(0).getPhoneNumber() : "";
            sb.append(phone).append(",");
            sb.append(c.getDateCreation() != null ? c.getDateCreation().toString() : "").append(",");
            sb.append(c.getStatus() != null ? c.getStatus().name() : "").append(",");
            sb.append(c.getMontantTotal()).append(",");
            sb.append(c.getModePaiement() != null ? c.getModePaiement().name() : "").append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
    // Get commande by ID
    public CommandeDTO getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(CommandeNotFoundException::new);
        return commandeMapper.toDto(commande);
    }
//    get all the clients
    public List<ClientDto> getClients(){
        return clientRepository.findAll().stream()
                .map(client -> {
                    ClientDto dto = clientMapper.toDto(client);
                    populateClientStats(client, dto);
                    return dto;
                }).toList();
    }

    // get all clients with filtering
    public List<ClientDto> getClientsFiltered(String search){
        var list = clientRepository.findAll();
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            list = list.stream()
                .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(lowerSearch)) ||
                             (c.getEmail() != null && c.getEmail().toLowerCase().contains(lowerSearch)) ||
                             (c.getPhones() != null && c.getPhones().stream().anyMatch(p -> p.getPhoneNumber() != null && p.getPhoneNumber().contains(lowerSearch))))
                .toList();
        }
        return list.stream().map(client -> {
            ClientDto dto = clientMapper.toDto(client);
            populateClientStats(client, dto);
            return dto;
        }).toList();
    }

    private void populateClientStats(Client client, ClientDto dto) {
        List<Commande> clientCommandes = commandeRepository.findByClientId(client.getId());
        dto.setTotalCommandes((long) clientCommandes.size());
        if (!clientCommandes.isEmpty()) {
            dto.setLastOrderDate(clientCommandes.stream()
                .map(Commande::getDateCreation)
                .max(java.util.Comparator.naturalOrder())
                .orElse(null));
        }
    }

    // get client statistics
    public ClientStatisticsDto getClientStatistics() {
        List<Client> allClients = clientRepository.findAll();
        long totalClients = allClients.size();
        
        java.time.YearMonth currentMonth = java.time.YearMonth.now();
        
        long nouveauxCeMois = allClients.stream()
            .filter(c -> c.getCreatedAt() != null && java.time.YearMonth.from(c.getCreatedAt()).equals(currentMonth))
            .count();
            
        long commandesCeMois = commandeRepository.findAll().stream()
            .filter(cmd -> cmd.getDateCreation() != null && java.time.YearMonth.from(cmd.getDateCreation()).equals(currentMonth))
            .count();
            
        double pourcentageNouveaux = totalClients == 0 ? 0 : (double) nouveauxCeMois / totalClients * 100;
        
        return ClientStatisticsDto.builder()
            .totalClients(totalClients)
            .commandesCeMois(commandesCeMois)
            .nouveauxCeMois(nouveauxCeMois)
            .pourcentageNouveaux(pourcentageNouveaux)
            .build();
    }

    //    get all the clients wiith commands details
    public List<CommandSummaryDto> getClientCommandes(Long id){
        var client = clientRepository.findById(id).orElseThrow(()-> new ClientNotFoundException("client not found"));
        return commandeRepository.findByClientId(client.getId()).stream().map(commandeMapper::TodTo).toList();
    }
}

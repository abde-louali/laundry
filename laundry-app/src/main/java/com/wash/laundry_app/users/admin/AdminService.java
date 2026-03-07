package com.wash.laundry_app.users.admin;

import com.wash.laundry_app.clients.ClientDto;
import com.wash.laundry_app.clients.ClientMapper;
import com.wash.laundry_app.clients.ClientNotFoundException;
import com.wash.laundry_app.clients.ClientRepository;
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
        return commandeRepository.findAll().stream().map(commandeMapper::TodTo).toList();
    }
    // Get commande by ID
    public CommandeDTO getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(CommandeNotFoundException::new);
        return commandeMapper.toDto(commande);
    }
//    get all the clients
    public List<ClientDto> getClients(){
        return clientRepository.findAll().stream().map(clientMapper::toDto).toList();
    }

    //    get all the clients wiith commands details
    public List<CommandSummaryDto> getClientCommandes(Long id){
        var client = clientRepository.findById(id).orElseThrow(()-> new ClientNotFoundException("client not found"));
        return commandeRepository.findByClientId(client.getId()).stream().map(commandeMapper::TodTo).toList();
    }
}

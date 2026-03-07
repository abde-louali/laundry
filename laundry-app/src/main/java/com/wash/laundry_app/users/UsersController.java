package com.wash.laundry_app.users;


import com.wash.laundry_app.auth.AuthService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/users")
public class UsersController {

    private final UserRepository userRepository;
    private UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private AuthService authService;
//    private final OrderRepository orderRepository;
//    private final UserService userService;


//    @GetMapping("/{id}")
//    public ResponseEntity<UserDto> getUser(@PathVariable Long id){
//        var user =  userRepository.findById(id).orElse(null);
//        if(user == null){
//           return ResponseEntity.notFound().build();
//        }
//      var userDto = new UserDto(user.getId(),user.getName(),user.getEmail());
//        return ResponseEntity.ok(userMapper.toDto(user));
//    }

//    @PostMapping
//    public ResponseEntity<?> registerUser(@RequestBody @Valid UserRegisterRequest request, UriComponentsBuilder uriBuilder){
//
//        if(userRepository.existsByEmail(request.getEmail())){
//            return ResponseEntity.badRequest().body(
//                    Map.of("email","invalid email ")
//            );
//        }
//        var user = userMapper.toEntity(request);
//        user.setPassword(passwordEncoder.encode(user.getPassword()));
//        user.setRole(Role.livreur);
//        userRepository.save(user);
//        var userDto = userMapper.toDto(user);
//        var uri = uriBuilder.path("/users/{id}").buildAndExpand(userDto.getId()).toUri();
//        return ResponseEntity.created(uri).body(userDto);
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<UserDto> updateUser(@PathVariable(name = "id") Long id, @RequestBody UpdateUserRequest request){
//        var user = userRepository.findById(id).orElse(null);
//        if(user == null){
//           return ResponseEntity.notFound().build();
//        }
//        userMapper.updateUser(request,user);
//        userRepository.save(user);
//        return ResponseEntity.ok(userMapper.toDto(user));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
//
//        var user = userRepository.findById(id).orElse(null);
//        if(user == null){
//            return ResponseEntity.notFound().build();
//        }
//        userRepository.delete(user);
//        return ResponseEntity.noContent().build();
//    }
//
//    @DeleteMapping()
//    public void deleteAll(){
//        userRepository.deleteAll();
//    }
//
//    @GetMapping("/orders")
//    public List<UserOrderSummaryDto> getUserOrders() {
//        var user = authService.currentUser();
//        var orders = orderRepository.findOrdersByUser(user);
//        return orders.stream().map(userMapper::toSummaryDto).toList();
//    }
//
//    @GetMapping("/orders/{orderId}")
//    public UserOrderDto getOrder(@PathVariable Long orderId){
//        return userService.getOrder(orderId);
//    }
//
//    @GetMapping("/orders/details/{orderId}")
//    public ResponseEntity<UserOrderDetailDto> getUserOrderDetails(@PathVariable Long orderId) {
//        UserOrderDetailDto orderDetails = userService.getOrderDetails(orderId);
//        var user = authService.currentUser();
//        if (!orderDetails.getCustomer().getCustomerId().equals(user.getId())) {
//            return ResponseEntity.badRequest().build();
//        }
//        return ResponseEntity.ok(orderDetails);
//    }
//
//    @PostMapping("/change-password")
//    public ResponseEntity<?> changePassword( @RequestBody ChangePasswordRequest request){
//        var user = authService.currentUser();
//        if(!passwordEncoder.matches(request.getOldPassword(),user.getPassword())){
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorDto("Invalid credentials"));
//        }
//        var newPassword = passwordEncoder.encode(request.getNewPassword());
//        user.setPassword(newPassword);
//        userRepository.save(user);
//        return ResponseEntity.noContent().build();
//    }



}



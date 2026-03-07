package com.wash.laundry_app.auth;

import com.wash.laundry_app.users.User;
import com.wash.laundry_app.users.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {
    private final UserRepository userRepository;

    public User currentUser(){
        var authenticated = SecurityContextHolder.getContext().getAuthentication();
        var userId = (Long) authenticated.getPrincipal();
        return userRepository.findById(userId).orElse(null);
    }
}


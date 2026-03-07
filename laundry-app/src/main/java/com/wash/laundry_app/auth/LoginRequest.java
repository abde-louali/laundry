package com.wash.laundry_app.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "email required")
    @Email(message = "enter a valid email")
    private String email;

    @NotBlank(message = "password required")
    private String password;
}

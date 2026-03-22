package com.wash.laundry_app.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}

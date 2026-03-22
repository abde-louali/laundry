package com.wash.laundry_app.auth;

import io.jsonwebtoken.security.Keys;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;

@Configuration
@ConfigurationProperties(prefix = "spring.jwt")
@Data
public class JwtConfig {

    private String secret;
    private int accessTokenExpiration;
    private int refreshTokenExpiration;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public int getAccessTokenExpiration() { return accessTokenExpiration; }
    public void setAccessTokenExpiration(int accessTokenExpiration) { this.accessTokenExpiration = accessTokenExpiration; }
    public int getRefreshTokenExpiration() { return refreshTokenExpiration; }
    public void setRefreshTokenExpiration(int refreshTokenExpiration) { this.refreshTokenExpiration = refreshTokenExpiration; }

    public javax.crypto.SecretKey getSecretKey(){
        return Keys.hmacShaKeyFor(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}

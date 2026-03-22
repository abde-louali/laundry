package com.wash.laundry_app.auth;

import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class TokenCleanupService {

    private static final Logger log = LoggerFactory.getLogger(TokenCleanupService.class);
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Purge expired refresh tokens every hour.
     * Prevents the refresh_tokens table from growing indefinitely.
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired refresh tokens...");
        refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}

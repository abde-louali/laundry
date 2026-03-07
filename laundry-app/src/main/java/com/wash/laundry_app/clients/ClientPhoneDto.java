package com.wash.laundry_app.clients;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClientPhoneDto {
    private Long id;
    private String phoneNumber;
    private LocalDateTime createdAt;
}

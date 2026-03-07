package com.wash.laundry_app.clients;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClientDto {

    private Long id;
    private String name;
    private String phone;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


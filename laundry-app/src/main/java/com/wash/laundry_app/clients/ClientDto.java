package com.wash.laundry_app.clients;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

@Data
public class ClientDto {

    private Long id;
    private String name;
    private List<ClientPhoneDto> phones;
    private List<ClientAddressDto> addresses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


package com.wash.laundry_app.clients;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ClientRegisterRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 255, message = "Le nom ne doit pas dépasser 255 caractères")
    private String name;

    private String email;

    private List<ClientPhoneDto> phones;

    private List<ClientAddressDto> addresses;
}

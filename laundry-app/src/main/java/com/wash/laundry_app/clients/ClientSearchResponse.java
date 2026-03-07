package com.wash.laundry_app.clients;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientSearchResponse {
    private boolean found;
    private ClientDto client;
}

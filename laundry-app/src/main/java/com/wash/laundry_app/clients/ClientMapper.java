package com.wash.laundry_app.clients;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClientMapper {

    Client toEntity(ClientRegisterRequest clientRegisterRequest);

    ClientDto toDto(Client client);
}

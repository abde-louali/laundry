package com.wash.laundry_app.command;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HistoriqueStatutMapper {

    @Mapping(target = "userName", source = "user.name")
    HistoriqueStatutDTO toDto(HistoriqueStatut historique);
}

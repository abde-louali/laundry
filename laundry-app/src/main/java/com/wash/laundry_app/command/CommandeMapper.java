package com.wash.laundry_app.command;

import com.wash.laundry_app.clients.ClientMapper;
import com.wash.laundry_app.users.UserMapper;
import com.wash.laundry_app.users.admin.CommandSummaryDto;
import com.wash.laundry_app.users.employe.CommandDetails;
import com.wash.laundry_app.users.employe.CommandDtoEmploye;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ClientMapper.class, UserMapper.class, CommandeTapisMapper.class})
public interface CommandeMapper {


    CommandeDTO toDto(Commande commande);

    CommandDtoEmploye todto(Commande commande);

    CommandDetails Todto (Commande commande);

    CommandSummaryDto TodTo (Commande commande);

}

package com.wash.laundry_app.command;


import com.wash.laundry_app.tapis.TapisMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {TapisMapper.class})
public interface CommandeTapisMapper {

    @Mapping(target = "tapis", source = "tapis")
    @Mapping(target = "tapisImages", source = "tapis.images")
    CommandeTapisDTO toDto(CommandeTapis commandeTapis);
}

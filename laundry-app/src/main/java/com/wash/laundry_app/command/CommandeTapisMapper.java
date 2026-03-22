package com.wash.laundry_app.command;

import com.wash.laundry_app.tapis.TapisMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {TapisMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CommandeTapisMapper {

    @Mapping(target = "tapis", source = "tapis")
    @Mapping(target = "tapisImages", source = "tapis.images")
    CommandeTapisDTO toDto(CommandeTapis commandeTapis);
}

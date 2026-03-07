package com.wash.laundry_app.tapis;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {TapisImageMapper.class})
public interface TapisMapper {

    @Mapping(target = "images", source = "images")
    TapisDTO toDto(Tapis tapis);

    Tapis toEntity(CreateTapisRequest request);
}

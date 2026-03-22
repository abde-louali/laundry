package com.wash.laundry_app.tapis;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {TapisImageMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TapisMapper {

    @Mapping(target = "images", source = "images")
    TapisDTO toDto(Tapis tapis);

    Tapis toEntity(CreateTapisRequest request);
}

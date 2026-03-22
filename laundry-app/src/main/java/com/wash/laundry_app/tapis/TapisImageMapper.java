package com.wash.laundry_app.tapis;


import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TapisImageMapper {

    TapisImageDTO toDto(TapisImage tapisImage);
}
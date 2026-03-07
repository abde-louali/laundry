package com.wash.laundry_app.tapis;


import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TapisImageMapper {

    TapisImageDTO toDto(TapisImage tapisImage);
}
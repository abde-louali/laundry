package com.wash.laundry_app.statistiques;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StatistiqueMapper {

    StatistiqueJournaliereDTO toDto(StatistiqueJournaliere statistique);
}
package com.wash.laundry_app.statistiques;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StatistiqueJournaliereRepository extends JpaRepository<StatistiqueJournaliere, Long> {

    Optional<StatistiqueJournaliere> findByDate(LocalDate date);

    List<StatistiqueJournaliere> findByDateBetweenOrderByDateDesc(LocalDate start, LocalDate end);

    List<StatistiqueJournaliere> findTop30ByOrderByDateDesc();
}
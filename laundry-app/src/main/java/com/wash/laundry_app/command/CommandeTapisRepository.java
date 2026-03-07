package com.wash.laundry_app.command;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommandeTapisRepository extends JpaRepository<CommandeTapis, Long> {

    List<CommandeTapis> findByCommandeId(Long commandeId);

    List<CommandeTapis> findByEtat(TapisEtat etat);

    List<CommandeTapis> findByCommandeIdAndEtat(Long commandeId, TapisEtat etat);

    long countByCommandeId(Long commandeId);
}
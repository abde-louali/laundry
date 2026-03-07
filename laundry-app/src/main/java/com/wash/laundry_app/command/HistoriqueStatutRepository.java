package com.wash.laundry_app.command;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriqueStatutRepository extends JpaRepository<HistoriqueStatut, Long> {

    List<HistoriqueStatut> findByCommandeIdOrderByCreatedAtDesc(Long commandeId);

    List<HistoriqueStatut> findByUserIdOrderByCreatedAtDesc(Long userId);
}

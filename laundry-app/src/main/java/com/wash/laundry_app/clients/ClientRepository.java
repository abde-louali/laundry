package com.wash.laundry_app.clients;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByPhone(String phone);

    boolean existsByPhone(String phone);

    List<Client> findByNameContainingIgnoreCase(String name);

    @Query("SELECT c FROM Client c " +
            "WHERE c.createdByLivreur.id = :livreurId " +
            "AND NOT EXISTS (" +
            "    SELECT cmd FROM Commande cmd WHERE cmd.client.id = c.id" +
            ")")
    Optional<Client> findPendingClientByLivreur(@Param("livreurId") Long livreurId);
}

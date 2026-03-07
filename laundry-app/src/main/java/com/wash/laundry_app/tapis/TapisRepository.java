package com.wash.laundry_app.tapis;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TapisRepository extends JpaRepository<Tapis, Long> {

    List<Tapis> findByNomContainingIgnoreCase(String nom);

    boolean existsByNom(String nom);
}
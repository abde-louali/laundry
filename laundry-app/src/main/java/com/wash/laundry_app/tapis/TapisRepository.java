package com.wash.laundry_app.tapis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TapisRepository extends JpaRepository<Tapis, Long> {
    boolean existsByNom(String nom);
}
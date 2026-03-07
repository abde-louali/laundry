package com.wash.laundry_app.tapis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


public interface TapisImageRepository extends JpaRepository<TapisImage, Long> {

    List<TapisImage> findByTapisId(Long tapisId);

    Optional<TapisImage> findByTapisIdAndIsMainTrue(Long tapisId);

    void deleteByTapisId(Long tapisId);
}

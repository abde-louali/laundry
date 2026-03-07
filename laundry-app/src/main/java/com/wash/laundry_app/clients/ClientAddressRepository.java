package com.wash.laundry_app.clients;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientAddressRepository extends JpaRepository<ClientAddress, Long> {
}

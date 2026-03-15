package com.wash.laundry_app.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

   Optional<Boolean> existsByEmail(String email);

   @Query("SELECT u FROM User u WHERE u.isActive = true AND u.role != com.wash.laundry_app.users.Role.admin")
   List<User> findAllActive();

    @Query("SELECT u FROM User u WHERE u.isActive = false AND u.role != com.wash.laundry_app.users.Role.admin")
    List<User> findAllInActive();
}
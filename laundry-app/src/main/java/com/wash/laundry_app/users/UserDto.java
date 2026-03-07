package com.wash.laundry_app.users;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private boolean isActive;
}

package com.wash.laundry_app.users;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String email;
    private String phone;
    private Role role;
}

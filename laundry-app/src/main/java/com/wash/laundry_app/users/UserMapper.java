package com.wash.laundry_app.users;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toEntity(UserRegisterRequest userRegisterRequest);

    UserDto toDto(User user);

    void updateUser(UpdateUserRequest updateUserRequest , @MappingTarget User user);
}

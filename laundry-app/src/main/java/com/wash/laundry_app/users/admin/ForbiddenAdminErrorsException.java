package com.wash.laundry_app.users.admin;

public class ForbiddenAdminErrorsException extends RuntimeException {
    public ForbiddenAdminErrorsException(String message) {
        super(message);
    }
}

package com.wash.laundry_app.users;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super();
    }
    public InvalidCredentialsException(String message) {
        super(message);
    }
}

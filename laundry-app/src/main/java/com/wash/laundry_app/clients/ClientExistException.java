package com.wash.laundry_app.clients;

public class ClientExistException extends RuntimeException {
    public ClientExistException(String message) {
        super(message);
    }
}

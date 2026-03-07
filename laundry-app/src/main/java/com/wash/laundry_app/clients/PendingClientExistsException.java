package com.wash.laundry_app.clients;

public class PendingClientExistsException extends RuntimeException {
    public PendingClientExistsException(String message) {
        super(message);
    }
}

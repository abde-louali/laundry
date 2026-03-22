package com.wash.laundry_app.command;

public class CommandeNotFoundException extends RuntimeException {
    public CommandeNotFoundException() {
        super();
    }
    public CommandeNotFoundException(String message) {
        super(message);
    }
}

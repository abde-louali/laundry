package com.wash.laundry_app.command;

public class ForbiddenOperationException extends RuntimeException {
    public ForbiddenOperationException() {
        super();
    }
    public ForbiddenOperationException(String message) {
        super(message);
    }
}

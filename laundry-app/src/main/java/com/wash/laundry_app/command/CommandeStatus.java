package com.wash.laundry_app.command;


public enum CommandeStatus {
    en_attente,      // Waiting for validation
    validee,         // Validated by employee
    en_traitement,   // Being cleaned
    prete,           // Ready for delivery (at workshop, not yet given to livreur)
    livree,          // Given to livreur (Sorti) - shows on delivery page
    payee,           // Paid (complete)
    annulee,         // Cancelled
    retournee        // Returned to workshop after cancellation
}

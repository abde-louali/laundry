package com.wash.laundry_app.command;


public enum CommandeStatus {
    en_attente,      // Waiting for validation
    validee,         // Validated by employee
    en_traitement,   // Being cleaned
    prete,           // Ready for delivery
    livree,           // Paid (complete),          // Delivered to customer
    payee,           // Paid (complete)
    annulee          // Cancelled
}

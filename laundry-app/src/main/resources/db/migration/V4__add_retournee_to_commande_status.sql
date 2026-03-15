ALTER TABLE commandes MODIFY COLUMN status ENUM('en_attente', 'validee', 'en_traitement', 'prete', 'livree', 'payee', 'annulee', 'retournee') DEFAULT 'en_attente';

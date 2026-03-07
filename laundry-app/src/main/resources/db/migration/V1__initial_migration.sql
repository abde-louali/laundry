
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('livreur', 'employe', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE clients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    created_by_livreur_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE commandes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id BIGINT NOT NULL,
    livreur_id BIGINT NOT NULL,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('en_attente', 'validee', 'en_traitement', 'prete', 'livree', 'payee', 'annulee') DEFAULT 'en_attente',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP NULL,
    date_livraison TIMESTAMP NULL,
    montant_total DECIMAL(10, 2) DEFAULT 0,
    mode_paiement ENUM('especes', 'carte', 'cheque', 'virement') NULL,
    date_paiement TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (livreur_id) REFERENCES users(id)
);


CREATE TABLE tapis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE commande_tapis (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    commande_id BIGINT NOT NULL,
    tapis_id BIGINT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(10, 2) NOT NULL,
    etat ENUM('en_attente', 'en_nettoyage', 'nettoye', 'livre') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (tapis_id) REFERENCES tapis(id)
);

CREATE TABLE tapis_images(
id BIGINT PRIMARY KEY AUTO_INCREMENT,
tapis_id BIGINT NOT NULL,
image_url VARCHAR(255) NOT NULL,
is_main BOOLEAN DEFAULT FALSE,

FOREIGN KEY (tapis_id) REFERENCES tapis(id) ON DELETE CASCADE
);

CREATE TABLE historique_statuts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    commande_id BIGINT NOT NULL,
    ancien_statut VARCHAR(50),
    nouveau_statut VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);



CREATE TABLE statistiques_journalieres (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL UNIQUE,
    nombre_commandes INT DEFAULT 0,
    revenus_total DECIMAL(10, 2) DEFAULT 0,
    nombre_tapis_traites INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE INDEX idx_commandes_status ON commandes(status);
CREATE INDEX idx_commandes_livreur ON commandes(livreur_id);
CREATE INDEX idx_commandes_client ON commandes(client_id);
CREATE INDEX idx_commandes_date ON commandes(date_creation);
CREATE INDEX idx_historique_commande ON historique_statuts(commande_id);
CREATE INDEX idx_users_role ON users(role);
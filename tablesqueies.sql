CREATE TABLE Roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL
);
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    force_password_change TINYINT(1) DEFAULT 1,
    -- Foreign Key Constraint
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);
CREATE TABLE Audit_Logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp DATETIME NOT NULL,
    user_id INT, -- NULLABLE in case of system-generated actions
    action_type VARCHAR(50),
    details TEXT,
    -- Foreign Key Constraint (use ON DELETE SET NULL if user deletion is allowed)
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
CREATE TABLE Vehicles (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50),
    color VARCHAR(50),
    make VARCHAR(100),
    fueltype VARCHAR(50),
    transmission VARCHAR(50),
    model VARCHAR(100)
);
CREATE TABLE Vehicle_Assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME, -- NULL when the assignment is current
    -- Foreign Key Constraints
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id),
    FOREIGN KEY (driver_id) REFERENCES Users(user_id)
);
CREATE TABLE Checklist_Templates (
    template_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    assigned_vehicle VARCHAR(100) NOT NULL,
    checklist_time VARCHAR(20) NOT NULL
);
CREATE TABLE Checklist_Items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    item_text VARCHAR(255) NOT NULL,
    sort_order INT,
    requires_ok TINYINT(1) DEFAULT 1,
    FOREIGN KEY (template_id) 
        REFERENCES Checklist_Templates(template_id)
        ON DELETE CASCADE  
);
--   SELECT User, Host FROM mysql.user;
--   SHOW GLOBAL VARIABLES LIKE 'port';

insert into Roles (role_name) values 
('Admin'),
('Driver'),
('Mechanic');

select * from roles;
select * from users ;
select * from vehicles;           
select * from Checklist_Templates;
select * from Checklist_Items;
--     user_id INT PRIMARY KEY AUTO_INCREMENT,
--     first_name VARCHAR(100) NOT NULL,
--     last_name VARCHAR(100) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     role_id INT NOT NULL,
--     is_active TINYINT(1) DEFAULT 1,
--     force_password_change TINYINT(1) DEFAULT 1,


insert into users(first_name,last_name,email,password_hash,role_id) values ("John","Driver","john.driver@fleet.com","sdsz",2);

CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Reference 'user_id' specifically
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
) ENGINE=InnoDB;

-- Replace '1' with your Admin ID and '2' with an existing Driver's User ID
INSERT INTO Messages (sender_id, receiver_id, message_text, created_at) 
VALUES 
(16, 35, 'Hello Admin, I have finished my checklist.', NOW()),
(16, 35, 'Great, thank you! I will review it now.', NOW());
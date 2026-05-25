DROP TABLE IF EXISTS Alerts;
DROP TABLE IF EXISTS Measurements;
DROP TABLE IF EXISTS Devices;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    passwordHash TEXT NOT NULL
);

CREATE TABLE Devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    serialNumber TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE Measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deviceId INTEGER NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    tvocLevel REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deviceId) REFERENCES Devices(id) ON DELETE CASCADE
);

CREATE TABLE Alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deviceId INTEGER NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'Warning',
    isResolved BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deviceId) REFERENCES Devices(id) ON DELETE CASCADE
);

-- Додамо тестовий пристрій для перевірки
INSERT INTO Users (id, email, passwordHash) VALUES ('user1', 'test@test.com', 'hash');
INSERT INTO Devices (userId, serialNumber, name) VALUES ('user1', 'ESP32_KITCHEN_01', 'Мій Холодильник');
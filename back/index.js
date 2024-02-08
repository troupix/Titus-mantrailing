const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Import the sqlite3 module
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Open a database connection
let db = new sqlite3.Database('./maxdb.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Create the "user" table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    password TEXT,
    mail TEXT
)`);

// Authentication route to register a new user
app.post('/api/register', (req, res) => {
    const { name, password, email } = req.body;
    // Perform validation and hashing of password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert the user into the "user" table
    db.run(`INSERT INTO user (name, password, mail) VALUES (?, ?, ?)`, [name, hashedPassword, email], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error registering user');
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        const token = jwt.sign({ id: this.lastID, name: email }, process.env.ACCESS_TOKEN_SECRET);
        console.log(token);
        res.json(200, { token });

    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists in the "user" table
    db.get(`SELECT * FROM user WHERE mail = ?`, [email], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error logging in');
        }

        if (!row) {
            return res.status(401).send('Invalid username or password');
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = bcrypt.compareSync(password, row.password);
        if (!passwordMatch) {
            return res.status(401).send('Invalid username or password');
        }

        // Generate a JWT token
        const token = jwt.sign({ id: row.id, name: row.mail }, process.env.ACCESS_TOKEN_SECRET);

        // Send the token as the response
        res.json({ token });
    });
});

//Check authentication
app.get('/api/authentication', authenticateToken, (req, res) => {
    res.sendStatus(200);
}
);


app.get('/', authenticateToken, (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

// Close the database connection when the app is closed
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
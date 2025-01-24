const express = require('express');
const fs = require('fs');
const path = require('path');  // Import path module for file path management
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));  // Serve your static HTML files (index.html, login.html, enroll.html)

// Path to user.json
const userFilePath = path.join(__dirname, 'user.json');

// POST request to save user enrollment data
app.post('/enroll', (req, res) => {
    const userData = req.body;

    // Read the current users file
    fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading user data:", err);
            return res.status(500).send('Error reading user data.');
        }

        let users = [];
        if (data) {
            try {
                users = JSON.parse(data);  // Parse existing users
            } catch (parseError) {
                console.error("Error parsing user data:", parseError);
                return res.status(500).send('Error parsing user data.');
            }
        }

        // Check if username already exists
        const existingUser = users.find(user => user.username === userData.username);
        if (existingUser) {
            return res.status(400).send('Username already exists.');
        }

        // Add new user to the list
        users.push(userData);

        // Save updated user data
        fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error("Error saving user data:", err);
                return res.status(500).send('Error saving user data.');
            }
            res.status(200).send('Enrollment successful!');
        });
    });
});

// POST request to validate login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Read the user data from the file
    fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading user data:", err);
            return res.status(500).send('Error reading user data.');
        }

        let users;
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            return res.status(500).send('Error parsing user data.');
        }

        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            res.status(200).send({ message: 'Login successful', username: user.username });
        } else {
            res.status(400).send('Invalid username or password.');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

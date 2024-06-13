const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 5000;
const app = express();

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Simulation d'une base de données d'utilisateurs
const users = [
    {
        "id": 1,
        "name": "John",
        "age": 31,
        "email": "john@example.com",
        "password": "$argon2i"
    },
    {
        "id": 2,
        "name": "Cédric",
        "age": 35,
        "email": "cedric@example.com",
        "password": "$argon2id"
    }
];

// Middleware pour hacher le mot de passe avant de l'ajouter à la base de données
const hashPassword = async (req, res, next) => {
    if (req.body.password) {
        try {
            console.log('Original Password:', req.body.password); // Log du mot de passe original
            const hashedPassword = await argon2.hash(req.body.password);
            console.log('Hashed Password:', hashedPassword); // Log du mot de passe haché
            req.body.password = hashedPassword; // Remplace le mot de passe original par le mot de passe haché dans la requête
            next(); // Passe à l'étape suivante du middleware
        } catch (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Error hashing password');
        }
    } else {
        res.status(400).send('Password is required');
    }
};

// Middleware pour vérifier le mot de passe et générer un token JWT
const verifyPassword = async (req, res, next) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).send('Invalid email or password');
    }

    try {
        const isVerified = await argon2.verify(user.password, password);
        if (isVerified) {
            console.log("Password accepted");
            const payload = { sub: user.id };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
                expiresIn: "4h",
            });

            delete user.password; // Supprime le mot de passe de l'utilisateur de l'objet retourné
            res.send({ user, token }); // Envoie l'utilisateur et le token JWT dans la réponse
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error verifying password');
    }
};

// Middleware pour vérifier le token JWT dans l'en-tête Authorization
const verifyToken = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new Error("Authorization header is missing");
        }

        const [type, token] = authorizationHeader.split(" ");

        if (type !== "Bearer") {
            throw new Error("Authorization header has not the 'Bearer' type");
        }

        req.payload = jwt.verify(token, process.env.JWT_SECRET || 'secret'); // Vérifie et décode le token JWT
        next(); // Passe à l'étape suivante du middleware
    } catch (err) {
        console.error(err);
        res.sendStatus(401); // Envoie une réponse 401 en cas d'erreur d'authentification
    }
};

// Routes

// Route GET pour récupérer la liste des utilisateurs (protégée par vérification de token)
app.get('/user', verifyToken, (req, res) => {
    res.json(users);
});

// Route GET pour récupérer un utilisateur spécifique par ID (protégée par vérification de token)
app.get('/user/:id', verifyToken, (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).send("User not found");
    }

    res.json(user);
});

// Route POST pour créer un nouvel utilisateur (avec hachage du mot de passe)
app.post('/user', hashPassword, (req, res) => {
    const { name, age, email, password } = req.body;
    const newUser = {
        id: users.length + 1, // Génère un nouvel ID unique
        name,
        age,
        email,
        password // Le mot de passe sera déjà haché par le middleware hashPassword
    };
    users.push(newUser); // Ajoute le nouvel utilisateur à la base de données simulée
    res.status(201).json(newUser); // Envoie une réponse JSON avec le nouvel utilisateur créé
});

// Route PUT pour mettre à jour un utilisateur existant par ID (avec hachage du mot de passe)
app.put('/user/:id', hashPassword, verifyToken, (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).send("User not found");
    }

    const { name, age, email, password } = req.body;
    const updatedUser = {
        id,
        name,
        age,
        email,
        password // Le mot de passe sera déjà haché par le middleware hashPassword
    };

    users[index] = updatedUser; // Met à jour l'utilisateur dans la base de données simulée
    res.status(200).json(updatedUser); // Envoie une réponse JSON avec l'utilisateur mis à jour
});

// Route DELETE pour supprimer un utilisateur par ID (protégée par vérification de token)
app.delete('/user/:id', verifyToken, (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).send("User not found");
    }

    users.splice(index, 1); // Supprime l'utilisateur de la base de données simulée
    res.status(200).send('User deleted'); // Envoie une réponse 200 (OK) pour indiquer que l'utilisateur a été supprimé
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

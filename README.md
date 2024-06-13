# Guide pour créer un backend CRUD avec Node.js et Express.js

Ce guide détaille les étapes pour créer un backend CRUD simple en utilisant Node.js et Express.js. Vous apprendrez à configurer un serveur, définir des routes CRUD, et tester les opérations avec Postman.

## Prérequis

- Node.js installé sur votre machine. Vous pouvez le télécharger depuis [nodejs.org](https://nodejs.org/).

## Étapes

### 1. Initialisation du projet

1. **Créer un nouveau répertoire** pour votre projet.
2. **Ouvrir une console (terminal)** dans ce répertoire et exécuter la commande suivante pour initialiser un projet Node.js :
npm init -y

markdown
Copier le code
Cela crée un fichier `package.json` avec des valeurs par défaut.

### 2. Installation d'Express.js

3. Installer Express.js en exécutant la commande suivante dans votre terminal :
npm install express

javascript
Copier le code

### 3. Configuration de `.gitignore`

4. Créer un fichier `.gitignore` à la racine du projet s'il n'existe pas déjà.
5. Ajouter `node_modules/` dans ce fichier `.gitignore` pour ignorer le dossier `node_modules` lors du versionnement.

### 4. Configuration de l'application

6. **Créer un fichier `app.js`** à la racine du projet.

7. **Ajouter le code suivant dans `app.js`** pour configurer votre serveur Express et définir les routes CRUD :

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Tableau d'objets utilisateurs (simulation de base de données)
let users = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 }
];

// Route GET pour récupérer tous les utilisateurs
app.get('/users', (req, res) => {
    res.json(users);
});

// Route GET pour récupérer un utilisateur par ID
app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).send('User not found');
    }

    res.json(user);
});

// Route POST pour créer un nouvel utilisateur
app.post('/users', (req, res) => {
    const { name, age } = req.body;
    const id = users.length + 1;
    const newUser = { id, name, age };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Route PUT pour mettre à jour un utilisateur par ID
app.put('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, age } = req.body;
    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).send('User not found');
    }

    users[index] = { id, name, age };
    res.json(users[index]);
});

// Route DELETE pour supprimer un utilisateur par ID
app.delete('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    users = users.filter(user => user.id !== id);
    res.status(204).send();
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
5. Tests avec Postman
Lancer votre serveur Node.js en exécutant node app.js dans votre terminal.

Ouvrir Postman et créer des requêtes pour tester les différentes routes :

GET http://localhost:5000/users : Récupérer tous les utilisateurs.
GET http://localhost:5000/users/1 : Récupérer l'utilisateur avec l'ID 1.
POST http://localhost:5000/users avec un corps JSON { "name": "New User", "age": 20 } : Créer un nouvel utilisateur.
PUT http://localhost:5000/users/1 avec un corps JSON { "name": "Updated User", "age": 25 } : Mettre à jour l'utilisateur avec l'ID 1.
DELETE http://localhost:5000/users/1 : Supprimer l'utilisateur avec l'ID 1.
Envoyer les requêtes et vérifier les réponses dans Postman pour vous assurer que tout fonctionne comme prévu.
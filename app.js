require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
const TOKEN_LIFETIME = '1h';

const app = express();
app.use(express.json());

// Demo user list. In a real app these come from a database and
// passwords are stored as bcrypt hashes, never as plain text.
const users = [{ id: 1, name: 'shadi rada', username: 'shadi', password: 'demo-password' }];

// POST /login  { "username": "shadi", "password": "demo-password" }  ->  { token }
app.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'wrong username or password' });
    }
    // Note: the option is "expiresIn". "expires" is rejected by jsonwebtoken.
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: TOKEN_LIFETIME });
    return res.json({ token });
});

// Middleware: reads "Authorization: Bearer <token>" and checks the signature.
const requireAuth = (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'missing token' });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'invalid or expired token' });
    }
};

// GET /profile  (needs the token from /login)
app.get('/profile', requireAuth, (req, res) => {
    res.json({ id: req.user.id, name: req.user.name });
});

if (require.main === module) {
    if (!JWT_SECRET) {
        console.error('Missing JWT_SECRET in .env (see .env.example)');
        process.exit(1);
    }
    app.listen(PORT, () => console.log(`server on port ${PORT}`));
}

module.exports = app;

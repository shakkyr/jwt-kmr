process.env.JWT_SECRET = 'test-secret';
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const app = require('../app');

let server;
let base;
before(() => new Promise((resolve) => {
    server = app.listen(0, () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
    });
}));
after(() => server.close());

const login = (body) => fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

test('login with correct password returns a token that opens /profile', async () => {
    const { token } = await (await login({ username: 'shadi', password: 'demo-password' })).json();
    const res = await fetch(`${base}/profile`, { headers: { Authorization: `Bearer ${token}` } });
    assert.strictEqual(res.status, 200);
    assert.strictEqual((await res.json()).name, 'shadi rada');
});

test('wrong password is rejected', async () => {
    assert.strictEqual((await login({ username: 'shadi', password: 'nope' })).status, 401);
});

test('/profile without a token is rejected', async () => {
    assert.strictEqual((await fetch(`${base}/profile`)).status, 401);
});

test('token signed with another secret is rejected', async () => {
    const forged = jwt.sign({ id: 1, name: 'hacker' }, 'other-secret');
    const res = await fetch(`${base}/profile`, { headers: { Authorization: `Bearer ${forged}` } });
    assert.strictEqual(res.status, 401);
});

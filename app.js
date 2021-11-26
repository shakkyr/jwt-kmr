const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')

const app = express();

const JWT_SECRET = 'this is jsonwebtoken secret frome my app'

app.get('/', (req,res , next)=>{
    let token = jwt.sign({
        name : 'shadi rada',
        age : 34 ,
    }, JWT_SECRET, {
        expires : "1h"
    });
    res.json({
        token: token
    });
});

app.post('/users', (req,res,next)=>{

});

app.listen(3000, ()=> {
    console.log('server on port 3000')
});
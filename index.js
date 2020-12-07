const { application } = require('express');
const { appendFile } = require('fs');

const express = require('express'),
    bodyParser = require('body-parser'),
    jwt = require('jsonwebtoken'),
    config = require('./config/config.js'),
    app = express();

//1. Configuramos clave secreta
app.set('key', config.mykey);

//2. Seteamos para que el body-parser nos convierta lo que viene del cliente
app.use(bodyParser.urlencoded({extended : true}));

//3. Lo pasamos a JSON
app.use(bodyParser.json());

//4. Arrancamos el servidor
app.listen(config.appPort, () => {
    console.log(`Servidor Corriendo en el puerto ${config.appPort}`);   
})

//5. Generamos un “punto de inicio”
app.get('/', (req, res) => {
    res.send('Inicio')
})

//6. Agregamos autenticacion
app.post('/generateToken', (req, res) => {
    if(req.body.user === 'clsc' && req.body.password === 'holamundo'){
        const payload = {
            check: true
        }

        const token = jwt.sign(payload, app.get('key'), {
            expiresIn : 1440
        })

        res.json({
            message: "Autentication successful",
            token
        })
    } else {
        res.json({message: "User or password incorrect."})
    }
})

//7. Generamos el middleware
const  protectedRoutes =  express.Router();
protectedRoutes.use((req, res, next) => {
    const token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, app.get('key'), (err, decoded)=>{
            if (err) {
                return res.json({message: 'Token inválida.'})
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        res.send({
            message: "Token no proveída."
        })
    }
})

//8. Endpoint que requiere token
app.get('/data', protectedRoutes, (req, res) =>{
    const data = [
        {id: 1, name: 'clsc'},
        {id: 2, name: 'Carlos'},
        {id: 3, name: 'Pepe'}
    ]

    res.json(data)
})


//Postman 

//Generar token:
/* curl -X POST -H 'Content-Type: application/json' -i http://localhost:3000/generateToken --data '{

   "user": "clsc",
   "password": "holamundo"
}' */


//Usar enpoint que usa token:
/* 
    curl -X GET -H 'access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGVjayI6dHJ1ZSwiaWF0IjoxNjA3Mjk5OTg5LCJleHAiOjE2MDczMDE0Mjl9.LzHEWQEAxta4rAkJCprexj4smFtadNjP22-nZcxJH1g' 
    -i http://localhost:3000/data 
*/
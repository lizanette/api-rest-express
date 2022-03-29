const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const usuarios = require("./routes/usuarios"); // Importa el archivo con las rutas para los usuarios
const express = require('express'); // importa express
const config = require('config');
const app = express(); // Crea una instancia de express
const logger = require('./logger');
const morgan = require('morgan');

// Middleware
// El middleware es un bloque de código que se ejecuta
// entre las peticiones del usuario (cliente)(request) y 
// el request que llega al servidor. Es un enlace entre
// la petición del usuario y el servidor, antes de que 
// éste pueda dar una respuesta.

// Las funciones de middleware son funciones que tienen
// acceso al objeto de petición (request, req), al objeto de 
// respuesta (response, res) y a la siguiente función del 
// middleware en el ciclo de peticiones/respuestas de la 
// aplicación. La siguiente función del middleware se denota
// normalmente con una variable denominada next.

// Las funciones de middleware pueden realizar las siguientes
// tareas:
//  - Ejecutar cualquier código
//  - Realizar cambios en la petición y los objetos de respuesta
//  - Finalizar el ciclo de petición / respuesta
//  - Invocar la siguiente función del middleware en la pila

// Express es un framework de direccionamiento y de uso de 
// middleware que permite que la aplicación tenga funcionalidad
// mínima propia.

// Ya usamos algunos middleware como express.json(),
// esto transforma el body del req a formato JSON

//            ------------------------
//  request -|-> json() --> route() -|-> response
//            ------------------------

// route() --> Hace referencia a las funciones GET, POST, PUT, DELETE

// JSON hace un parsing de la entrada a formato JSON
// De tal forma que lo que recibamos en el req de una
// petición esté en formato JSON
app.use(express.json()); // Se le dice a express que use este middleware
app.use(express.urlencoded({extended: true}));
// public es el nombre de la carpeta que tendrá los recursos estáticos
app.use(express.static('public'));
app.use("api/usuarios", usuarios);

// con SETX NODE_ENV production o SETX NODE_ENV development, se va cambiando de entorno

console.log(`Aplicación: ${config.get('nombre')}`);
console.log(`DB server: ${config.get('configDB.host')}`);

// Uso de middleware de tercero - morgan
if (app.get('env') == 'development') {
    app.use(morgan('tiny'));
    inicioDebug('Morgan está habilitado.');
}

// Operaciones con la base de datos
dbDebug('Conectado a la base de datos...');

app.use(logger); // logger ya hace referencia a la función correspondiente

app.use(function(req, res, next) {
    console.log('Autenticando...');
    next();
});

// Query string
// url/?var1=valor1&var2=valor2&var3=valor3...

//Hay cuatro tipos de peticiones
// app.get(); // Consulta datos
// app.post(); // Envia datos al servidor (insertar datos)
// app.put();  // Actualiza datos
// app.delete();   // Elimina datos

// Consulta en la ruta raíz de nuestro servidor
// con una función callback
app.get('/', (req, res) => {
    res.send("Hola mundo desde Express");
});


// Usando el módulo process, se lee una variable
// de entorno
// Si la variable no existe, va a tomar un valor
// por default (3000)
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}.`);
});

// Se creó una variable de entorno con SETX PORT 5000, desde la terminal

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nomb) {
    const schema = Joi.object({
        nombre:Joi.string().min(3).required()
    });
    return (schema.validate({nombre:nomb}));
}
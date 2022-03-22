const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express = require('express'); // importa express
const config = require('config');
const Joi = require('joi'); // importa Joi
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

const usuarios = [
    {id: 1, nombre: 'Juan'},
    {id: 2, nombre: 'Ana'},
    {id: 3, nombre: 'Karen'},
    {id: 4, nombre: 'Luis'}
];

// Consulta en la ruta raíz de nuestro servidor
// con una función callback
app.get('/', (req, res) => {
    res.send("Hola mundo desde Express");
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

// Cómo pasar parámetros dentro de las rutas
// p. ej. solo quiero un usuario específico en vez de todos
// Con los : delante del id Express sabe que es
// un parámetro a recibir
// http://localhost:5000/api/usuarios/1990/2/sex='m'
app.get('/api/usuarios/:id', (req, res) => {
    // .find() devuelve el primer elemento del arreglo que cumpla con un predicado
    // parseInt() hace el casteo a entero directamente 
    let usuario = existeUsuario(req.params.id)
    if (!usuario)
        res.status(404).send("El usuario no se encuentra."); // Devuelve el estado HTTP
    res.send(usuario);
});

// ========= PETICIÓN POST ==========
// Tiene el mismo nombre que la petición GET
// Express hace la diferencia dependiendo del 
// tipo de petciión
app.post('/api/usuarios', (req, res) => {
    // El objeto req tiene la propiedad body
    const {value, error} = validarUsuario(req.body.nombre);
    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
     } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    console.log(value, error);
});

// ========= PETICIÓN PUT ==========
// Método para actualizar información
// Recibe el id del usuario que se requiere modificar
// utilizando un parámetro en la ruta :id
app.put('/api/usuarios/:id', (req, res) => {
    // Validar que el usuario se encuentre en los registros
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send("El usuario no se encuentra.");
        return;
    }
    // En el body del request debe venir la información 
    // para hacer la actualización
    // Validar que el nombre cumpla con las condiciones
    // El objeto req tiene la propiedad body
    const {value, error} = validarUsuario(req.body.nombre)
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    // Actualiza el nombre del usuario:
    usuario.nombre = value.nombre;
    res.send(usuario);
});

// ========= PETICIÓN DELETE ==========
// Método para eliminar información
// Recibe el id del usuario que se quiere eliminar
// utilizando un parámetro en la ruta :id
app.delete('/api/usuarios/:id', (req, res) => {
    const usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send('El usuario no se encuentra.');
        return;
    }
    // Encontrar el índice del usuario dentro del arreglo
    // Devuelve el índice de la primera ocurrencia del elemento
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1); // Elimina el elemento en el índice indicado
    res.send(usuario); // Responde con el usuario eliminado
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
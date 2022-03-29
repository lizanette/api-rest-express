const express = require("express");
const Joi = require('joi'); // importa Joi
const ruta = express.Router();

const usuarios = [
    {id: 1, nombre: 'Juan'},
    {id: 2, nombre: 'Ana'},
    {id: 3, nombre: 'Karen'},
    {id: 4, nombre: 'Luis'}
];

ruta.get('/', (req, res) => {
    res.send(usuarios);
});

// Cómo pasar parámetros dentro de las rutas
// p. ej. solo quiero un usuario específico en vez de todos
// Con los : delante del id Express sabe que es
// un parámetro a recibir
// http://localhost:5000/api/usuarios/1990/2/sex='m'
ruta.get('/:id', (req, res) => {
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
ruta.post('/', (req, res) => {
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
ruta.put('/:id', (req, res) => {
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
ruta.delete('/:id', (req, res) => {
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

function existeUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nomb) {
    const schema = Joi.object({
        nombre:Joi.string().min(3).required()
    });
    return (schema.validate({nombre:nomb}));
}

module.exports = ruta; // Se exporta el objeto ruta
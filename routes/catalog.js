var express = require('express');
var router = express.Router();

// Require controller modules.
var coche_controller = require('../controllers/cocheController');
var concesionario_controller = require('../controllers/concesionarioController');
var cliente_controller = require('../controllers/clienteController');

/// COCHE ROUTES ///

// GET catalog home page.
router.get('/', coche_controller.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/coche/create', coche_controller.coche_create_get);

// POST request for creating Book.
router.post('/coche/create', coche_controller.coche_create_post);

// GET request to delete Book.
router.get('/coche/:id/delete', coche_controller.coche_delete_get);

// POST request to delete Book.
router.post('/coche/:id/delete', coche_controller.coche_delete_post);

// GET request to update Book.
router.get('/coche/:id/update', coche_controller.coche_update_get);

// POST request to update Book.
router.post('/coche/:id/update', coche_controller.coche_update_post);

// GET request for one Book.
router.get('/coche/:id', coche_controller.coche_detail);

// GET request for list of all Book items.
router.get('/coches', coche_controller.coche_list);

/// CONCESIONARIO ROUTES ///

// GET request for creating concesionario. NOTE This must come before route for id (i.e. display concesionario).
router.get('/concesionario/create', concesionario_controller.concesionario_create_get);

// POST request for creating concesionario.
router.post('/concesionario/create', concesionario_controller.concesionario_create_post);

// GET request to delete concesionario.
router.get('/concesionario/:id/delete', concesionario_controller.concesionario_delete_get);

// POST request to delete concesionario.
router.post('/concesionario/:id/delete', concesionario_controller.concesionario_delete_post);

// GET request to update concesionario.
router.get('/concesionario/:id/update', concesionario_controller.concesionario_update_get);

// POST request to update concesionario.
router.post('/concesionario/:id/update', concesionario_controller.concesionario_update_post);

// GET request for one concesionario.
router.get('/concesionario/:id', concesionario_controller.concesionario_detail);

// GET request for list of all concesionarios.
router.get('/concesionarios', concesionario_controller.concesionario_list);

/// CLIENTES ROUTES ///

// GET request for creating a cliente. NOTE This must come before route that displays cliente (uses id).
router.get('/cliente/create', cliente_controller.cliente_create_get);

//POST request for creating cliente.
router.post('/cliente/create', cliente_controller.cliente_create_post);

// GET request to delete cliente.
router.get('/cliente/:id/delete', cliente_controller.cliente_delete_get);

// POST request to delete cliente.
router.post('/cliente/:id/delete', cliente_controller.cliente_delete_post);

// GET request to update cliente.
router.get('/cliente/:id/update', cliente_controller.cliente_update_get);

// POST request to update cliente.
router.post('/cliente/:id/update', cliente_controller.cliente_update_post);

// GET request for one cliente.
router.get('/cliente/:id', cliente_controller.cliente_detail);

// GET request for list of all cliente.
router.get('/clientes', cliente_controller.cliente_list);





module.exports = router;
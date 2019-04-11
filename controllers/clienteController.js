var Cliente = require('../models/cliente');
var Coche = require('../models/coche');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Cliente.
exports.cliente_list = function(req, res, next) {

  Cliente.find()
    .sort([['nombre', 'ascending']])
    .exec(function (err, list_clientes) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('cliente_list', { title: 'Lista de clientes', cliente_list:  list_clientes});
    });

};

// Display detail page for a specific Cliente.
exports.cliente_detail = function(req, res, next) {

    async.parallel({
        cliente: function(callback) {

            Cliente.findById(req.params.id)
              .exec(callback);
        },

        cliente_coches: function(callback) {
          Coche.find({ 'cliente': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.cliente==null) { // No results.
            var err = new Error('Cliente not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('cliente_detail', { title: 'Cliente Detail', cliente: results.cliente, cliente_coches: results.cliente_coches } );
    });

};

// Display Cliente create form on GET.
exports.cliente_create_get = function(req, res, next) {
    res.render('cliente_form', { title: 'Create Cliente'});
};

// Handle Cliente create on POST.
exports.cliente_create_post = [

    // Validate that the fields are not empty.
    body('nombre', 'Cliente nombre required').isLength({ min: 1 }).trim(),
    body('apellidos', 'Cliente apellidos required').isLength({ min: 1 }).trim(),
    body('fecha_nacimiento', 'Cliente fecha nacimiento required').isLength({ min: 1 }).trim(),

    // Sanitize (trim) the field.
    sanitizeBody('nombre').escape(),
    sanitizeBody('apellidos').escape(),
    sanitizeBody('fecha_nacimiento').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a cliente object with escaped and trimmed data.
        var cliente = new Cliente(
            {
                nombre: req.body.nombre,
                apellidos: req.body.apellidos,
                fecha_nacimiento: req.body.fecha_nacimiento
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('cliente_form', { title: 'Create Cliente', cliente: cliente, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Cliente with same name already exists.
            Cliente.findOne({ 'nombre': req.body.nombre })
                .exec( function(err, found_cliente) {
                     if (err) { return next(err); }

                     if (found_cliente) {
                         // Cliente exists, redirect to its detail page.
                         res.redirect(found_cliente.url);
                     }
                     else {

                         cliente.save(function (err) {
                           if (err) { return next(err); }
                           // Cliente saved. Redirect to cliente detail page.
                           res.redirect(cliente.url);
                         });

                     }

                 });
        }
    }
];


// Display Cliente delete form on GET.
exports.cliente_delete_get = function(req, res, next) {

    async.parallel({
        cliente: function(callback) {
            Cliente.findById(req.params.id).exec(callback);
        },
        cliente_coches: function(callback) {
            Coche.find({ 'cliente': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.cliente==null) { // No results.
            res.redirect('/catalog/clientes');
        }
        // Successful, so render.
        res.render('cliente_delete', { title: 'Eliminando Cliente', cliente: results.cliente, cliente_coches: results.cliente_coches } );
    });

};

// Handle Cliente delete on POST.
exports.cliente_delete_post = function(req, res, next) {

    async.parallel({
        cliente: function(callback) {
            Cliente.findById(req.params.id).exec(callback);
        },
        cliente_coches: function(callback) {
            Coche.find({ 'cliente': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.cliente_coches.length > 0) {
            // Cliente has coches. Render in same way as for GET route.
            res.render('cliente_delete', { title: 'Eliminar Cliente', cliente: results.cliente, cliente_coches: results.cliente_coches } );
            return;
        }
        else {
            // Cliente has no coches. Delete object and redirect to the list of clientes.
            Cliente.findByIdAndRemove(req.body.id, function deletecliente(err) {
                if (err) { return next(err); }
                // Success - go to clientes list.
                res.redirect('/catalog/clientes');
            });

        }
    });

};

// Display Cliente update form on GET.
exports.cliente_update_get = function(req, res, next) {

    Cliente.findById(req.params.id, function(err, cliente) {
        if (err) { return next(err); }
        if (cliente==null) { // No results.
            var err = new Error('Cliente not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('cliente_form', { title: 'Update Cliente', cliente: cliente });
    });

};

// Handle Cliente update on POST.
exports.cliente_update_post = [
   
    // Validate that the fields are not empty.
    body('nombre', 'Cliente nombre required').isLength({ min: 1 }).trim(),
    body('apellidos', 'Cliente apellidos required').isLength({ min: 1 }).trim(),
    body('fecha_nacimiento', 'Cliente fecha de nacimiemto required').isLength({ min: 1 }).trim(),
    
    // Sanitize (escape) the fields.
    sanitizeBody('nombre').escape(),
    sanitizeBody('apellidos').escape(),
    sanitizeBody('fecha_nacimiento').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a cliente object with escaped and trimmed data (and the old id!)
        var cliente = new Cliente(
          {
          nombre: req.body.nombre,
          apellidos: req.body.apellidos,
          fecha_nacimiento: req.body.fecha_nacimiento,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('cliente_form', { title: 'Update Cliente', cliente: cliente, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Cliente.findByIdAndUpdate(req.params.id, cliente, {}, function (err,thecliente) {
                if (err) { return next(err); }
                   // Successful - redirect to cliente detail page.
                   res.redirect(thecliente.url);
                });
        }
    }
];

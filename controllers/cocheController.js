var Coche = require('../models/coche')
var Concesionario = require('../models/concesionario')
var Cliente = require('../models/cliente')
var async = require('async')


const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');



exports.index = function(req, res) {

    async.parallel({
        coche_count: function(callback) {
            Book.count(callback);
        },
        concesionario_count: function(callback) {
            Concesionario.count(callback);
        },
        
        cliente_count: function(callback) {
            Cliente.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Home Concesionario', error: err, data: results });
    });
};

// Lista de todos los coches
exports.coche_list = function (req, res, next) {


    Coche.find({}, 'marca modelo ')
        .populate('concesionario')
        .exec(function (err, list_coches) {
          if (err) { return next(err); }
          // Successful, so render
          res.render('coche_list', { title: 'Listado de coches', coche_list:  list_coches});
    });


};

//Detalle del coche por concesionario especifico
exports.coche_detail = function (req, res, next) {

    async.parallel({
        coche: function(callback) {

            Coche.findById(req.params.id)
              .populate('concesionario')
              .populate('cliente')
              .exec(callback);
        },
        coches_concesionarios: function(callback) {

          Concesionario.find({ 'coche': req.params.id })
          .exec(callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.coche==null) { // No results.
            var err = new Error('No de ha encntrado ningun coche');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('coche_detail', { title: 'Detalles del coche', coche:  results.coche, coches_concesionarios: results.coches_concesionarios } );
    });

};

// Cargamos la pantalla del formulario del coche
exports.coche_create_get = function (req, res, next) {
    //res.render('coche_form', { title: 'Crear Coche' });

    // Conseguir los concesionarios, que podremos añadirlo en la tabla coche.
    async.parallel({
        concesionarios: function(callback) {
            Concesionario.find(callback);
        },

        clientes: function(callback) {
            Cliente.find(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        res.render('coche_form', { title: 'Crear Coche', concesionarios:results.concesionarios, clientes:results.clientes });
    });
};

// Handle Coche create on POST.
exports.coche_create_post = [

// Convertir Clientes en una Array.
    (req, res, next) => {
        if(!(req.body.cliente instanceof Array)){
            if(typeof req.body.cliente==='undefined')
            req.body.cliente=[];
            else
            req.body.cliente=new Array(req.body.cliente);
        }
        next();
    },

    // Validar campos.
    body('marca').isLength({ min: 1 }).trim().withMessage('El nombre de la marca es obligatorio')
        .isAlphanumeric().withMessage('El nombre de la marca tiene que tener nombres alphanumericos.'),

    body('modelo').isLength({ min: 1 }).trim().withMessage('El nombre del modelo es obligatorio')
        .isAlphanumeric().withMessage('El nombre del modelo tiene que tener nombres alphanumericos.'),

    body('fecha_de_fabricacion', 'Fecha de fabricación invalida').optional({ checkFalsy: true }).isISO8601(),
    body('color', 'No as escrito color').optional({ checkFalsy: true }).isISO8601(),
    body('precio_venta', 'No has escrito el precio de venta').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('marca').escape(),
    sanitizeBody('modelo').escape(),
    sanitizeBody('fecha_de_fabricacion').toDate(),
    sanitizeBody('color').escape(),
    sanitizeBody('precio_venta').toInt(),

    sanitizeBody('cliente.*').escape(),

    // Proceso despues de la validación y la "sanilizacion".
    (req, res, next) => {

        //Extraemos los errores validacion por el request
        const errors = validationResult(req);
        
        // Creamos un objeto coche
        var coche = new Coche(
            {
                marca: req.body.marca,
                modelo: req.body.modelo,
                fecha_de_fabricacion: req.body.fecha_de_fabricacion,
                color: req.body.color,
                precio_venta: req.body.precio_venta,
                cliente: req.body.cliente
            }
        );

        if (!errors.isEmpty()) {
            // Hay errores. Render form again with sanitized values/errors messages.

            // Conseguir todos los concesionarios y clientes para elformulario.
            async.parallel({
                concesionarios: function(callback) {
                    Concesionario.find(callback);
                },
                clientes: function(callback) {
                    Cliente.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('coche_form', { title: 'Crear Coche', marca: marca, errors: errors.array() });
            });
            return;
        }
        else {
            // La informacion del formulario es valida

            // Guardar coche.
            coche.save(function (err) {
                if (err) { return next(err); }
                // Correcto - ahora redirije a la vista del coche
                res.redirect(coche.url);
            });
        }
    }
];



// Display Coche delete form on GET.
exports.coche_delete_get = function (req, res, next) {

    async.parallel({
        coche: function (callback) {
            Coche.findById(req.params.id).populate('concesionario').populate('cliente').exec(callback)
        },
        coches_concesionarios: function (callback) {
            Concesionario.find({ 'coche': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.coche == null) { // No results.
            res.redirect('/catalog/coches');
        }
        // Successful, so render.
        res.render('coche_delete', { title: 'Borrar coche', coche: results.coche, coches_concesionarios: results.coches_concesionarios });
    });

};

// Handle Coche delete on POST.
exports.coche_delete_post = function (req, res, next) {

    async.parallel({
        coche: function (callback) {
            Coche.findById(req.body.id).populate('concesionario').populate('cliente').exec(callback)
        },
        coches_concesionarios: function (callback) {
            Concesionario.find({ 'coche': req.body.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.coches_concesionarios.length > 0) {
            // Coche esta en un concesionario. 
            res.render('coche_delete', { title: 'Borrar Coche', coche: results.coche, coches_concesionarios: results.coches_concesionarios });
            return;
        }
        else {
            // Coche no esta en ningun concesionario. Borramos y redirigimos a lista de oches
            Coche.findByIdAndRemove(req.body.id, function deleteCoche(err) {
                if (err) { return next(err); }
                // Success 
                res.redirect('/catalog/coches')
            })

        }
    });

};

// Display Coche update form on GET.
exports.coche_update_get = function (req, res, next) {

    /*Coche.findById(req.params.id, function (err, coche) {
        if (err) { return next(err); }
        if (coche == null) { // No results.
            var err = new Error('Coche not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('coche_form', { title: 'Update Coche', coche: coche });

    });*/

// Aqui conseguimos el coche, el concesionario y los clientes del formulario.
    async.parallel({
        coche: function(callback) {
            Coche.findById(req.params.id).populate('concesionario').populate('cliente').exec(callback);
        },
        concesionarios: function(callback) {
            Concesionario.find(callback);
        },
        clientes: function(callback) {
            Cliente.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.coche==null) { // No results.
                var err = new Error('No se ha encontrado el coche');
                err.status = 404;
                return next(err);
            }
            // Success.
            
            res.render('coche_form', { title: 'Actualizar Coche', concesionarios:results.concesionarios, clientes:results.clientes, coche: results.coche });
        });

};

// Handle Coche update on POST.
exports.coche_update_post = [

// Convertimos los clientes en una array.
    (req, res, next) => {
        if(!(req.body.cliente instanceof Array)){
            if(typeof req.body.cliente==='undefined')
            req.body.cliente=[];
            else
            req.body.cliente=new Array(req.body.cliente);
        }
        next();
    },

    // Validate fields.
    body('marca').isLength({ min: 1 }).trim().withMessage('El nombre de la marca es obligatorio')
        .isAlphanumeric().withMessage('El nombre de la marca tiene que tener nombres alphanumericos.'),

    body('modelo').isLength({ min: 1 }).trim().withMessage('El nombre del modelo es obligatorio')
        .isAlphanumeric().withMessage('El nombre del modelo tiene que tener nombres alphanumericos.'),

    body('fecha_de_fabricacion', 'Fecha de fabricación invalida').optional({ checkFalsy: true }).isISO8601(),
    body('color', 'No as escrito color').optional({ checkFalsy: true }).isISO8601(),
    body('precio_venta', 'No has escrito el precio de venta').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('marca').escape(),
    sanitizeBody('modelo').escape(),
    sanitizeBody('fecha_de_fabricacion').toDate(),
    sanitizeBody('color').escape(),
    sanitizeBody('precio_venta').toInt(),

    sanitizeBody('cliente.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Creamos el objeto Coche con escaped y trimmed 
        var coche = new Coche(
            {
                marca: req.body.marca,
                modelo: req.body.modelo,
                fecha_de_fabricacion: req.body.fecha_de_fabricacion,
                color: req.body.color,
                precio_venta: req.body.precio_venta,
                cliente: (typeof req.body.cliente==='undefined') ? [] : req.body.cliente,
                _id:req.params.id // Se requiere este campo o si no se pondra otra id de cliente
            }
        );

        if (!errors.isEmpty()) {
            // Hay errores. Renderiza el formulario nuevamente con valores vacios y un mensaje de error.

            /*res.render('coche_form', { title: 'Actualizar Coche', coche: coche, errors: errors.array() });
            return;*/

            // Conseguimos todos los concesioarios y clientes del formulario
            async.parallel({
                concesionarios: function(callback) {
                    Concesionario.find(callback);
                },
                clientes: function(callback) {
                    Cliente.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('coche_form', { title: 'Actualizar Coche', concesionarios:results.concesionarios, clientes:results.clientes, coche: coche, errors: errors.array() });
            });
            return;
        
        }
        
        else {
            // Los valores son validos. Actualiza
            Coche.findByIdAndUpdate(req.params.id, coche, {}, function (err, thecoche) {
                if (err) { return next(err); }
                // Successful
                res.redirect(thecoche.url);
            });
        }
    }
];

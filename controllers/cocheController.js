var Coche = require('../models/coche')
var Concesionario = require('../models/concesionario')
var Cliente = require('../models/cliente')
var async = require('async')


const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');



exports.index = function(req, res) {

    async.parallel({
        coche_count: function(callback) {
            Coche.count(callback);
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
        todos_concesionarios: function(callback) {
            Concesionario.find(callback);
        },
        /*todos_clientes: function(callback) {
            Cliente.find(callback);
        },*/
        
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.coche==null) { // No results.
            var err = new Error('No de ha encntrado ningun coche');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('coche_detail', { title: 'Detalles del coche', coche:  results.coche, coches_concesionarios: results.coches_concesionarios, todos_concesionarios: results.todos_concesionarios, /*todos_clientes: results.todos_clientes*/ } );
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

        /*clientes: function(callback) {
            Cliente.find(callback);
        },*/

    }, function(err, results) {
        if (err) { return next(err); }
        res.render('coche_form', { title: 'Crear Coche', concesionarios:results.concesionarios /*clientes:results.clientes*/ });
    });
};

// Handle Coche create on POST.
exports.coche_create_post = [

    // Validar campos.
    body('marca').isLength({ min: 1 }).trim(),

    body('modelo').isLength({ min: 1 }).trim(),

    body('fecha_de_fabricacion', 'Fecha de fabricación invalida').isLength({ min: 1 }).trim(),
    body('color', 'No as escrito color').isLength({ min: 1 }).trim(),
    body('precio_venta', 'No has escrito el precio de venta').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('marca').escape(),
    sanitizeBody('modelo').escape(),
    sanitizeBody('fecha_de_fabricacion').toDate(),
    sanitizeBody('color').escape(),
    sanitizeBody('precio_venta').toInt(),


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
                precio_venta: req.body.precio_venta
            }
        );

        if (!errors.isEmpty()) {
            // Hay errores. 

            // Conseguir todos los concesionarios y clientes para el formulario.
            async.parallel({
                concesionarios: function(callback) {
                    Concesionario.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('coche_form', { title: 'Crear Coche', marca: results.marca, /*clientes: results.clientes,*/ errors: errors.array() });
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

        todos_concesionarios: function(callback) {
            Concesionario.find(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.coche == null) { // No results.
            res.redirect('/catalog/coches');
        }
        // Successful, so render.
        res.render('coche_delete', { title: 'Borrar coche', coche: results.coche, coches_concesionarios: results.coches_concesionarios, todos_concesionarios: results.todos_concesionarios });
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
        /*clientes: function(callback) {
            Cliente.find(callback);
        },*/
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.coche==null) { // No results.
                var err = new Error('No se ha encontrado el coche');
                err.status = 404;
                return next(err);
            }
            // Success.
            
            res.render('coche_form', { title: 'Actualizar Coche', concesionarios:results.concesionarios, /*clientes:results.clientes,*/ coche: results.coche });
        });

};

// Handle Coche update on POST.
exports.coche_update_post = [


    // Validate fields.
    body('marca').isLength({ min: 1 }).trim().withMessage('El nombre de la marca es obligatorio')
        .isAlphanumeric().withMessage('El nombre de la marca tiene que tener nombres alphanumericos.'),

    body('modelo').isLength({ min: 1 }).trim().withMessage('El nombre del modelo es obligatorio')
        .isAlphanumeric().withMessage('El nombre del modelo tiene que tener nombres alphanumericos.'),

    body('color', 'No has escrito el color').isLength({ min: 1 }).trim(),
    body('fecha_de_fabricacion', 'Fecha de fabricación invalida').optional({ checkFalsy: true }).isISO8601(),
    
    body('precio_venta', 'No has escrito el precio de venta').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('marca').escape(),
    sanitizeBody('modelo').escape(),
    sanitizeBody('color').escape(),
    sanitizeBody('fecha_de_fabricacion').escape(),
    sanitizeBody('precio_venta').escape(),


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
                _id:req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // Hay errores. Renderiza el formulario nuevamente con valores vacios y un mensaje de error.

            // Conseguimos todos los concesioarios y clientes del formulario
            async.parallel({
                concesionarios: function(callback) {
                    Concesionario.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('coche_form', { title: 'Actualizar Coche', concesionarios:results.concesionarios, coche: coche, errors: errors.array() });
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

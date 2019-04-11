var Concesionario = require('../models/concesionario');
var async = require('async');
var Coche = require('../models/coche');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Concesionarios.
exports.concesionario_list = function (req, res, next) {

    Concesionario.find()
        .sort([['nombre', 'ascending']])
        .exec(function (err, list_concesionarios) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('concesionario_list', { title: 'Lista Concesionarios', concesionario_list: list_concesionarios });
        })

};

// Display detail page for a specific Concesionario.
exports.concesionario_detail = function (req, res, next) {

    async.parallel({
        concesionario: function (callback) {
            Concesionario.findById(req.params.id)
                .exec(callback)
        },/*
        concesionarios_coches: function (callback) {
            Coche.find({ 'concesionario': req.params.id }, 'title summary')
                .exec(callback)
        },*/
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.concesionario == null) { // No results.
            var err = new Error('Concesionario not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('concesionario_detail', { title: 'Concesionario Detail', concesionario: results.concesionario/*, concesionario_coches: results.concesionarios_coches */});
    });

};

// Display Concesionario create form on GET.
exports.concesionario_create_get = function (req, res, next) {
    res.render('concesionario_form', { title: 'Añadir Concesionario' });
};

// Handle Concesionario create on POST.
exports.concesionario_create_post = [

    // Validate fields.
    body('nombre_concesionario').isLength({ min: 1 }).trim().withMessage('Nombre must be specified.'),
    body('marca_concesionario').isLength({ min: 1 }).trim().withMessage('Marca must be specified.'),
    body('localizacion_concesionario').isLength({ min: 1 }).trim().withMessage('Localizacion must be specified.'),
    body('fecha_apertura_concesionario', 'Invalid fecha de apertura.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('nombre_concesionario').escape(),
    sanitizeBody('marca_concesionario').escape(),
    sanitizeBody('localizacion_concesionario').escape(),
    sanitizeBody('fecha_apertura_concesionario').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create Concesionario object with escaped and trimmed data
        var concesionario = new Concesionario(
            {
                nombre_concesionario: req.body.nombre_concesionario,
                marca_concesionario: req.body.marca_concesionario,
                localizacion_concesionario: req.body.localizacion_concesionario,
                fecha_apertura_concesionario: req.body.fecha_apertura_concesionario,
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('concesionario_form', { title: 'Volver a intentar: Añadir concesionario', concesionario: concesionario, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Save concesionario.
            concesionario.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new concesionario record.
                res.redirect(concesionario.url);
            });
        }
    }
];



// Display Concesionario delete form on GET.
exports.concesionario_delete_get = function (req, res, next) {

    async.parallel({
        concesionario: function (callback) {
            Concesionario.findById(req.params.id).exec(callback)
        },
        concesionarios_coches: function (callback) {
            Coche.find({ 'concesionario': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.concesionario == null) { // No results.
            res.redirect('/catalog/concesionarios');
        }
        // Successful, so render.
        res.render('concesionario_delete', { title: 'Eliminando', concesionario: results.concesionario, concesionario_coches: results.concesionarios_coches });
    });

};

// Handle Concesionario delete on POST.
exports.concesionario_delete_post = function (req, res, next) {

    async.parallel({
        concesionario: function (callback) {
            Concesionario.findById(req.body.concesionarioid).exec(callback)
        },/*
        concesionarios_coches: function (callback) {
            Coche.find({ 'concesionario': req.body.concesionarioid }).exec(callback)
        },*/
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        /*if (results.concesionarios_coches.length > 0) {
            // Concesionario has coches. Render in same way as for GET route.
            res.render('concesionario_delete', { title: 'Delete Concesionario', concesionario: results.concesionario, concesionario_coches: results.concesionarios_coches });
            return;
        }*/
        else {
            // Concesionario has no coches. Delete object and redirect to the list of concesionarios.
            Concesionario.findByIdAndRemove(req.body.concesionarioid, function deleteConcesionario(err) {
                if (err) { return next(err); }
                // Success - go to concesionario list.
                res.redirect('/catalog/concesionarios')
            })

        }
    });

};

// Display Concesionario update form on GET.
exports.concesionario_update_get = function (req, res, next) {

    Concesionario.findById(req.params.id, function (err, concesionario) {
        if (err) { return next(err); }
        if (concesionario == null) { // No results.
            var err = new Error('Concesionario not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('concesionario_form', { title: 'Update Concesionario', concesionario: concesionario });

    });
};

// Handle Concesionario update on POST.
exports.concesionario_update_post = [

    // Validate fields.
    body('nombre_concesionario').isLength({ min: 1 }).trim().withMessage('Nombre must be specified to update.'),
    body('marca_concesionario').isLength({ min: 1 }).trim().withMessage('Marca must be specified to update.'),
    body('localizacion_concesionario').isLength({ min: 1 }).trim().withMessage('localizacion must be specified to update.'),
    body('fecha_apertura_concesionario', 'Invalid fecha de apertura.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('nombre_concesionario').escape(),
    sanitizeBody('marca_concesionario').escape(),
    sanitizeBody('localizacion_concesionario').escape(),
    sanitizeBody('fecha_apertura_concesionario').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Concesionario object with escaped and trimmed data (and the old id!)
        var concesionario = new Concesionario(
            {
                nombre_concesionario: req.body.nombre_concesionario,
                marca_concesionario: req.body.marca_concesionario,
                localizacion_concesionario: req.body.localizacion_concesionario,
                fecha_apertura_concesionario: req.body.fecha_apertura_concesionario,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('concesionario_form', { title: 'Update Concesionario', concesionario: concesionario, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Concesionario.findByIdAndUpdate(req.params.id, concesionario, {}, function (err, theconcesionario) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(theconcesionario.url);
            });
        }
    }
];

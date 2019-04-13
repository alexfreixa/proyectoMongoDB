#! /usr/bin/env node

console.log('Este script populate añade coches, clientes y concesionarios en tu base de datos. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
/*var Book = require('./models/book')
var Author = require('./models/author')
var Genre = require('./models/genre')
var BookInstance = require('./models/bookinstance')
*/
var Coche = require('./models/coche')
var Cliente = require('./models/cliente')
var Concesionario = require('./models/concesionario')



var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/*var authors = []
var genres = []
var books = []
var bookinstances = []
*/
var coches = []
var clientes = []
var concesionarios = []


function concesionarioCreate(nombre_concesionario, marca_concesionario, localizacion_concesionario, fecha_apertura_concesionario, cb) {
  concesionariodetail = {nombre_concesionario:nombre_concesionario , marca_concesionario: marca_concesionario, localizacion_concesionario: localizacion_concesionario }
  if (fecha_apertura_concesionario != false) concesionariodetail.fecha_apertura_concesionario = fecha_apertura_concesionario
  
  var concesionario = new Concesionario(concesionariodetail);
       
  concesionario.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Concesionario: ' + concesionario);
    concesionarios.push(concesionario)
    cb(null, concesionario)
  }  );
}

function clienteCreate(nombre, apellidos, fecha_nacimiento, coche, cb) {
  
  clientedetail = { 
    nombre: nombre,
    apellidos: apellidos,
    fecha_nacimiento: fecha_nacimiento
  }
  if (coche != false) clientedetail.coche = coche

  var cliente = new Cliente(clientedetail);

  cliente.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + cliente);
    clientes.push(cliente)
    cb(null, cliente);
  }   );
}

function cocheCreate(marca, modelo, fecha_de_fabricacion, color, precio_venta, cb) {
  cochedetail = { 
    marca: marca,
    modelo: modelo,
    fecha_de_fabricacion: fecha_de_fabricacion,
    color: color,
    precio_venta: precio_venta
  }
    
  var coche = new Coche(cochedetail);    
  coche.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Coche: ' + coche);
    coches.push(coche)
    cb(null, coche)
  }  );
}


function createConcesionarios(cb) {
    async.series([
        function(callback) {
          concesionarioCreate('Renault', 'Renault', 'Calle Torredembarra', '1973-06-06', callback);
        },
        function(callback) {
          concesionarioCreate('Toyota', 'Toyta', 'Calle Montblanc', '1992-11-8', callback);
        },
        function(callback) {
          concesionarioCreate('Tesla', 'Tesla', 'Calle Matadepera', '2015-04-06', callback);
        },
        ],
        // optional callback
        cb);
}


function createCoches(cb) {
    async.parallel([
        function(callback) {
          cocheCreate(concesionarios[0], 'Clio', '2001-06-06', 'verde', 10000, callback);
        },
        function(callback) {
          cocheCreate(concesionarios[1], 'Corolla', '2005-07-16', 'gris', 10000, callback);
        },
        function(callback) {
          cocheCreate(concesionarios[0], 'Kadjar', '2015-12-17', 'gris', 10000, callback);
        },
        ],
        // optional callback
        cb);
}


function createClientes(cb) {
    async.parallel([
        function(callback) {
          clienteCreate('Andres', 'Baco', '1997-06-20', [coches[0],], callback)
        },
        function(callback) {
          clienteCreate('Pepe', 'Viyuela', '1970-05-28', [coches[1],], callback)
        },
        ],
        // Optional callback
        cb);
}



async.series([
    createConcesionarios,
    createCoches,
    createClientes
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    /*else {
        console.log('BOOKInstances: '+bookinstances);
        
    }*/
    // All done, disconnect from database
    mongoose.connection.close();
});





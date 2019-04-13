var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var ConcesionarioSchema = new Schema(
  {
    nombre_concesionario: {type: String, required: true, max: 100},
    marca_concesionario: {type: String, required: true, max: 100},
    localizacion_concesionario: {type: String, required: true, max: 100},
    fecha_apertura_concesionario: {type: Date}
  }
);

// Virtual for concesionario's URL
ConcesionarioSchema
.virtual('url')
.get(function () {
  return '/catalog/concesionario/' + this._id;
});

// Virtual for author's full name
ConcesionarioSchema
.virtual('nombre')
.get(function () {
  return this.nombre_concesionario;
});

ConcesionarioSchema
.virtual('marca')
.get(function () {
  return this.marca_concesionario;
});

ConcesionarioSchema
.virtual('localizacion')
.get(function () {
  return this.localizacion_concesionario;
});

ConcesionarioSchema
.virtual('fecha_apertura')
.get(function () {
  return this.fecha_apertura_concesionario ? moment(this.fecha_apertura_concesionario).format('YYYY-MM-DD') : 'Sin información';
});



//Export model
module.exports = mongoose.model('Concesionario', ConcesionarioSchema);
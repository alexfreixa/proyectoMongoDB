var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var CocheSchema = new Schema(
  {
    //marca: {type: String, required: true, max: 100},
    marca: {type: Schema.Types.ObjectId, ref: 'Concesionario', required: true},
    modelo: {type: String, required: true, max: 100},
    fecha_de_fabricacion: {type: Date},
    color: {type: String},
    precio_venta: {type: Number},
  }
);

// Virtual para la URL de coche
CocheSchema
.virtual('url')
.get(function () {
  return '/catalog/coche/' + this._id;
});


// Virtual para coche Marca-Modelo
CocheSchema
.virtual('marca_modelo')
.get(function () {
  return this.marca + ' ' + this.modelo;
});
/*
// Virtual para coche fecha de fabricacion formateada
CocheSchema
.virtual('fecha_de_fabricacion_formatted')
.get(function () {
  return this.fecha_de_fabricacion ? moment(this.fecha_de_fabricacion).format('YYYY-MM-DD') : 'Sin información';
});

// Virtual para color del coche
CocheSchema
.virtual('color')
.get(function () {
  return this.color;
});

// Virtual para precio del coche
CocheSchema
.virtual('precio_venta')
.get(function () {
  return this.precio_venta;
});



CocheSchema
.virtual('url')
.get(function () {
  return '/catalog/coche/' + this._id;
});
*/
//Export model
module.exports = mongoose.model('Coche', CocheSchema);
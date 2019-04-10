var mongoose = require('mongoose');

//Nombre, Apellidos, Fecha Nacimiento.

var Schema = mongoose.Schema;

var ClienteSchema = new Schema({
    nombre: {type: String, required: true, min: 2, max: 40},
    apellidos: {type: String, required: true, min: 2, max: 100},
    fecha_nacimiento: {type: Date}
    //edad
});

ClienteSchema
.virtual('nombre')
.get(function () {
  return this.apellidos + ', ' + this.nombre;
});

ClienteSchema
.virtual('fecha_nacimiento')
.get(function () {
  return (this.fecha_nacimiento).toString();
});

ClienteSchema
.virtual('url')
.get(function () {
  return '/catalog/cliente/'+this._id;
});

// Export model.
module.exports = mongoose.model('Cliente', ClienteSchema);
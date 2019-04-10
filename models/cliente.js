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
.virtual('nombre_apellido')
.get(function () {
  return this.apellidos + ', ' + this.nombre;
});

ClienteSchema
.virtual('fecha_nacimiento_formatted')
.get(function () {
  //return (this.fecha_nacimiento).toString();
  return this.fecha_nacimiento ? moment(this.fecha_nacimiento).format('YYYY-MM-DD') : 'Sin información';
});

ClienteSchema
.virtual('url')
.get(function () {
  return '/catalog/cliente/'+this._id;
});

// Export model.
module.exports = mongoose.model('Cliente', ClienteSchema);
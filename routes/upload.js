var express = require('express');
var app = express();
var fileUpload = require('express-fileupload')
var fs = require('fs');


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de coleccion no valida.',
            errors: {
                message: 'Las colecciones validas son: ' + tiposValidos.join(', ')
            }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No se han enviado archivos.',
            errors: {
                message: 'debe seleccionar una imagen'
            }
        });
    }
    //Obtener nombre archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones se aceptan
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension no valida.',
            errors: {
                message: 'Las extensiones validas son: ' + extensionesValidas.join(', ')
            }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = id + '-' + new Date().getMilliseconds() + '.' + extensionArchivo;

    //Mover el archivo a un path
    var path = './uploads/' + tipo + '/' + nombreArchivo;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res)

    })
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error obteniendo usuario',
                    errors: err
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe usuario',
                    errors: {
                        message: 'No existe usuario'
                    }
                });
            }
            // Si existe elimina imagen anterior
            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if (err) {

                }
                usuarioActualizado.password = '';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    usuario: usuarioActualizado
                })

            })
        })
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error obteniendo medico',
                    errors: err
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe medico',
                    errors: {
                        message: 'No existe medico'
                    }
                });
            }
            // Si existe elimina imagen anterior
            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {

                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizada',
                    medico: medicoActualizado
                })

            })
        })
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error obteniendo hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'No existe hospital',
                    errors: {
                        message: 'No existe hospital'
                    }
                });
            }
            // Si existe elimina imagen anterior
            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {

                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital Actualizada',
                    hospital: hospitalActualizado
                })

            })
        })
    }




}

module.exports = app;
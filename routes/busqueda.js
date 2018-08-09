var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario')

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');

    if (tabla == 'usuario') {
        buscarUsuario(busqueda, regex).then((respuesta) => {
            res.status(200).json({
                ok: true,
                usuarios: respuesta
            });
        })
    }
    if (tabla == 'hospital') {
        buscarHospitales(busqueda, regex).then((respuesta) => {
            res.status(200).json({
                ok: true,
                hospitales: respuesta
            });
        })
    }
    if (tabla == 'medico') {
        buscarMedicos(busqueda, regex).then((respuesta) => {
            res.status(200).json({
                ok: true,
                medicos: respuesta
            });
        })
    }
});

app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');


    Promise.all([buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex), buscarUsuario(busqueda, regex)])
        .then((respuestas) => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email role')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al obtener hospitales', err);
                }
                resolve(hospitales);
            });

    });

}


function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({
                nombre: regex
            })
            .populate('hospital')
            .populate('usuario', 'nombre email role')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al obtener medicos', err);
                }
                resolve(medicos);
            });

    });

}

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{
                nombre: regex
            }, {
                email: regex
            }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al obtener usuarios', err);
                }
                resolve(usuarios);
            });
    });

}

module.exports = app;
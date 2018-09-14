var express = require('express');
var Medico = require('../models/medico');
var middlewareAuth = require('../middlewares/auth').verificaToken;
var app = express();

// ==============================================
// Obtener todos los Hospitales
// ==============================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });

        });
});


// ==============================================
// Obtener medico
// ==============================================
app.get('/:id', (req, res, next) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con id ' + id + ' no existe.',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medico
            });


        });
});



// ==============================================
// Crear nuevo Medico
// ==============================================
app.post('/', middlewareAuth, (req, res) => {
    var body = req.body;


    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Medico',
                errors: err,
                medico: body
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoSaved
        });
    });
});




// ==============================================
// Actualizar medico
// ==============================================
app.put('/:id', middlewareAuth, (req, res) => {
    var body = req.body;
    var id = req.params.id;

    //verifica si existe
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe medico con ese ID'
                }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.hospital = body.hospital;

        medico.save((err, medicoSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoSaved
            });
        });
    });
});

// ==============================================
// Eliminar medico
// ==============================================
app.delete('/:id', middlewareAuth, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: {
                    message: 'No existe medico con ese id'
                }
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoBorrado
        });
    })
});

module.exports = app;
var express = require('express');
var Hospital = require('../models/hospital');
var middlewareAuth = require('../middlewares/auth').verificaToken;
var app = express();

// ==============================================
// Obtener todos los Hospitales
// ==============================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({})
    .populate('usuario', 'nombre email')
    .skip(desde)
    .limit(5)
    .exec(
        (err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                })
            }
            Hospital.count({}, (err,conteo) =>{
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                })
            })
           
        });
});

// ==============================================
// Crear nuevo Hospital
// ==============================================
app.post('/', middlewareAuth, (req, res) => {
    var body = req.body;


    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.email,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando Hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalSaved
        });
    });
});

// ==============================================
// Actualizar hospital
// ==============================================
app.put('/:id', middlewareAuth, (req, res) => {
    var body = req.body;
    var id = req.params.id;

    //verifica si existe
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe hospital con ese ID'
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;

        hospital.save((err, hospitalSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalSaved
            });
        });
    });
});


// ==============================================
// Eliminar hospital
// ==============================================
app.delete('/:id', middlewareAuth, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: {
                    message: 'No existe hospital con ese id'
                }
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});

module.exports = app;
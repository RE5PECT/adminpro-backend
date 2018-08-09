var express = require('express');
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var middlewareAuth = require('../middlewares/auth').verificaToken;
var app = express();

// ==============================================
// Obtener todos los usuarios
// ==============================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({},
            'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    })
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });

            });
});


app.get('/grafico1', (req, res, next) => {
   

    Usuario.aggregate([
        {
            $group: {
                _id: '$role',  //agrupar por rol
                count: {$sum: 1}
            }
        }
    ],(err, result) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error calculando usuarios',
                errors: err
            })
        } 

        res.status(200).json({
            ok: true,
            data: result
        });
    });
});

// ==============================================
// Crear nuevo usuarios
// ==============================================
app.post('/', (req, res) => {
    var body = req.body;


    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando usuario',
                errors: err,
                usuario: req.usuario
            });
        }
        usuarioSaved.password = '';
        res.status(201).json({
            ok: true,
            usuario: usuarioSaved
        });
    });
});

// ==============================================
// Actualizar usuario
// ==============================================
app.put('/:id', middlewareAuth, (req, res) => {
    var body = req.body;
    var id = req.params.id;

    //verifica si existe
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe usuario con ese ID'
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            usuario.password = null;

            res.status(201).json({
                ok: true,
                usuario: usuarioSaved
            });
        });
    });
});

// ==============================================
// Eliminar usuario
// ==============================================
app.delete('/:id', middlewareAuth, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: {
                    message: 'No existe usuario con ese id'
                }
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});




module.exports = app;
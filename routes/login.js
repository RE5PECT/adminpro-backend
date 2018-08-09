var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

const {
    OAuth2Client
} = require('google-auth-library');
var app = express();


const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
verify().catch(console.error);


app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            })
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales no validas - email',
                errors: {
                    message: 'Credenciales no validas - email'
                }
            })
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales no validas - password',
                errors: {
                    message: 'Credenciales no validas - password'
                }
            })
        }
        usuarioDB.password = null;
        var token = jwt.sign({
                usuario: usuarioDB
            },
            SEED, {
                expiresIn: 14400
            });

        res.status(200).json({
            ok: true,
            mensaje: 'login post correcto',
            token: token,
            usuario: usuarioDB
        })
    })


})

app.post('/google', async (req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch((err) => {
            res.status(403).json({
                ok: false,
                mensaje: 'Token no valido',
                errors: {
                    messag: 'Token invalido'
                }
            })
        })


    Usuario.findOne({
        email: googleUser.email
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            })
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Debe autenticarse con contraseña',
                    errors: {
                        message: 'Debe autenticarse con contrase{a'
                    }
                })
            } else {
                var token = jwt.sign({
                        usuario: usuarioDB
                    },
                    SEED, {
                        expiresIn: 14400
                    });

                res.status(200).json({
                    ok: true,
                    mensaje: 'login post correcto',
                    token: token,
                    usuario: usuarioDB
                })
            }
        } else {
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = ":)";
            usuario.google = true;

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar usuario',
                        errors: {
                            message: 'Error al guardar usuario'
                        }
                    })
                }

                var token = jwt.sign({
                        usuario: usuarioDB
                    },
                    SEED, {
                        expiresIn: 14400
                    });

                res.status(200).json({
                    ok: true,
                    mensaje: 'login post correcto',
                    token: token,
                    usuario: usuarioDB
                })
            })

        }



    })

})

module.exports = app;
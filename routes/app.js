var express =  require('express');
var app = express();

app.get('/', (req, res, next) => {
    res.status(404).json({
        ok: false,
        mensaje: 'Peticion fallida'
    });   
});

module.exports = app;
// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var serveIndex = require('serve-index')
var cors = require('cors')

//Inicializar Variables
var app =  express();
app.use(cors());
// body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Conexion a BD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('MongoDB: \x1b[32m%s\x1b[0m','online');
});

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imgRoutes = require('./routes/img');
//Rutas

//app.use(express.static(__dirname + '/'))
//app.use('/uploads', serveIndex(__dirname + '/uploads'));

app.use('/usuario/', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico/', medicoRoutes)
app.use('/login/', loginRoutes);
app.use('/busqueda/', busquedaRoutes);
app.use('/upload/', uploadRoutes);
app.use('/img/', imgRoutes);
app.use('/', appRoutes);

// Escuchar Peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});
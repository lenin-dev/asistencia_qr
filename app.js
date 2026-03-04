const express = require('express');
const fs = require('node:fs');
const cors = require('cors');
const path = require('node:path');
const { routeErrorHandling, notFoundRouter } = require('./api/middleware/error.middleware.js');

const addmatricula = require('./api/middleware/matricula.schema.js');
const validateDates = require('./api/middleware/validar.schema.js');
const asistencia = require('./api/models/asistencias.js');
const LoginModel = require('./api/models/login.js');
const verificarToken = require('./api/middleware/verificar.token.middleware.js');
const conn = require('./api/connection/conn.js');

const app = express();


app.use(cors({
    origin: ['http://localhost:3002', 'https://asistencia.institutosocrates.mx', 'https://msg-auto-app-asistencia-socrates.lwmhph.easypanel.host'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['token', 'Origin', 'Accept', 'Content-Type'],
    exposedHeaders: ['token']
}));
app.use(express.json());



app.use(express.static(path.join(__dirname, './')));

app.post('/login', async (req, res, next) => {
    let pool;
    try {
        pool = await conn();
        const loginModel = new LoginModel(pool);
        const result = await loginModel.login(req.body);
        res.header('token', result[0]);
        res.status(200).json(result[1]);
    }
    catch (e) {
        next(e);
    } finally {
        if (pool) pool.release();
    }
});

app.post('/logout', async (req, res, next) => {
    let pool;
    try {
        pool = await conn();
        const loginModel = new LoginModel(pool);
        const token = req.header('token');
        const result = await loginModel.logout(token);
        res.status(200).json(result)
    }
    catch (error) {
        next(error);
    } finally {
        if (pool) pool.release();
    }
});

app.post('/registrar', 
verificarToken(['Admin', 'Asistente']),
async (req, res, next) => {
    let pool;
    try {
        pool = await conn();
        const loginModel = new LoginModel(pool);
        const result = await loginModel.registrar(req.body);
        res.status(200).json({
            message: 'Creacion del usuario correctamente'
        })
    }
    catch (error) {
        next(error);
    } finally {
        if (pool) pool.release();
    }
});






app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/asistencias_api', 
verificarToken(['Admin', 'Asistente', 'Consultor', 'Verificador']),
async (req, res, next) => {
    let pool;
    try {
        pool = await conn();
        const asis = new asistencia(pool);
        const resultado = await asis.asistencias();
        res.json(resultado);
    } catch (e) {
        next(e);
    } finally {
        if (pool) pool.release();
    }
});

app.get('/lista_alumnos', 
    verificarToken(['Admin', 'Asistente', 'Consultor']), 
    async (req, res, next) => {
    let pool;
    try {
        pool = await conn();
        const asis = new asistencia(pool);
        const resultado = await asis.listaalumnos();
        res.json(resultado);
    } catch (e) {
        next(e);
    } finally {
        if (pool) pool.release();
    }
});

app.post('/crear_asistencias_api',
verificarToken(['Admin', 'Asistente']),
validateDates(addmatricula, 'body'),
async (req, res, next) => {
    let pool;
    try {
        pool = await conn();
        const asis = new asistencia(pool);
        const {matriculaSoc} = req.body

        if(await asis.Oneasistencias(matriculaSoc) === 0) {
            const resultado = await asis.crearasistencia(matriculaSoc);
            res.json(resultado);
        } else {
            res.json({
                message: 'asistencia ya ingresada'
            });
        }

        
    } catch (e) {
        next(e);
    } finally {
        if (pool) pool.release();
    }
});

app.use(routeErrorHandling);
app.use(notFoundRouter);

app.listen(3002, '0.0.0.0', () => {
    console.log('server escuchando en el puerto http://localhost:'+3002);
});
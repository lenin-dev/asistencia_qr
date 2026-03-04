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
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000


app.use(cors({
    origin: ['http://localhost:3000', 'https://asistenciasocrates.duckdns.org', 'https://asistencia.institutosocrates.mx', 'https://asistencia-socrates.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['token', 'Origin', 'Accept', 'Content-Type'],
    exposedHeaders: ['token']
}));
app.use(express.json());



app.use(express.static(path.join(__dirname, './')));

app.get('/health', (req, res) => {
    res.status(200).send('ok');
});

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`server escuchando en el puerto ${PORT}`);
});

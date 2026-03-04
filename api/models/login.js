const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv/config');
const { fechaExpiracion, fechaLarga } = require('../middleware/expiration.fecha.middlware.js');

class LoginModel {

    con;

    constructor(pool) {
        this.con = pool;
    }

    async login(data) {
        try {
            const SECRETPASS = process.env.SECRETPASSJWT;
            const { usuario, password } = data;

            const [rows] = await this.con.query('SELECT idusuarios, usuario, password, nombreCompleto, privilegio, estado, fCreacion FROM usuarios WHERE usuario = ?', [usuario]);
            if(rows.length === 0) {
                throw new Error('Usuario o contraseña incorrecto');
            }
            
            if (!await bcrypt.compare(password, rows[0].password)) {
                throw new Error('Usuario o contraseña incorrecto');
            }

            const token = jwt.sign(Object.assign({}, rows), SECRETPASS, { expiresIn: '2h' });

            const encontro = await this.buscarToken(rows[0].idusuarios);

            if (encontro) {
                await this.createRefreshToken(rows[0].idusuarios, token);
            }
            else {
                await this.addToken(token, rows[0].idusuarios);
            }
            await this.createRefreshToken(rows[0].idusuarios, token);
            const dataEsport = rows.map(data => {
                return {
                    idusuarios: data.idusuarios,
                    usuario: data.usuario,
                    privilegio: data.privilegio,
                    nombreCompleto: data.nombreCompleto,
                    estado: data.estado,
                    fCreacion: data.fCreaci,
                }
            });
            return [ token, dataEsport ]

        } catch (error) {
            throw error;
        }
    }

    async logout(token) {
        try {
            const query = 'DELETE FROM tokens WHERE token = ?';
            const [rows] = await this.con.query(query, [token]);
            if (rows.length === 0) {
                throw new Error('No se logro eliminar el token');
            }
            return {
                code: 200,
                message: 'Sesión cerrada correctamente',
            };
        }
        catch (error) {
            throw error;
        }
    }

    async registrar(datosRegistrar) {
        try {

            const { usuario, password, nombreCompleto, privilegio } = datosRegistrar;
            const hash = bcrypt.hashSync(password, 10);
            const fechaLarg = fechaLarga();
            const query = `INSERT INTO usuarios (usuario, password, nombreCompleto, privilegio, fCreacion) VALUES (?, ?, ?, ?, ?)`;
            const [rows] = await this.con.query(query, [usuario, hash, nombreCompleto, privilegio, fechaLarg]);
            if (rows.affterdRows === 0) {
                throw new Error('No se logro almacenar el usuario');
            }
        }
        catch (error) {
            throw error;
        }
    }

    async addToken(token, idusuario) {
        try {

            const fechaAct = fechaLarga();
            const fechaExp = fechaExpiracion(fechaAct, '2h');
            const query = 'INSERT INTO tokens(idusuario, token, inicio, expiracion, fCreacion) VALUES (?,?,?,?,?)';
            const [rows] = await this.con.query(query, [idusuario, token, fechaAct, fechaExp, fechaAct]);
            if (rows.affectedRows === 0) {
                throw new Error('No se logro guardar el token');
            }
        }
        catch (error) {
            throw error;
        }
    }

    async createRefreshToken(idusuario, token) {
        try {
            const fechaAct = fechaLarga();
            const fechaExp = fechaExpiracion(fechaAct, '2h');

            const query = 'UPDATE tokens SET token = ?, inicio = ?, expiracion = ?, fCreacion = NOW() WHERE idusuario = ?';
            const [rows] = await this.con.query(query, [token, fechaAct, fechaExp, idusuario]);
            if (rows.affectedRows === 0) {
                throw new Error('No se logro actualizar el token');
            }
        }
        catch (error) {
            throw error;
        }
    }

    async buscarToken(idusuario) {
        const query = 'SELECT COUNT(idusuario) AS contar FROM tokens WHERE idusuario = ?';
        const [rows] = await this.con.query(query, [idusuario]);

        return rows[0].contar > 0;
    }

        async deleteAutoToken() {
        try {

            const result = await this.con.query('DELETE FROM tokens WHERE expiracion < NOW()');
            if (result.affectedRows > 0) {
                throw new Error(`✅ ${result.affectedRows} Tokens expirados eliminados.`);
            }
        }
        catch (error) {
            throw error;
        }
    }

}

module.exports = LoginModel;
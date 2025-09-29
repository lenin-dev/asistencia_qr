const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function verifyToken(roles) {
    return async (req, res, next) => {
        try {
            const token = req.headers['token'];
            if (!token) {
                throw new Error('El token de autenticación no está presente');
            }
            const data = await contentToken(token);
            if (!data || typeof data === 'string') {
                throw new Error('El token no es válido o no contiene los datos necesarios.');
            }
            const datarol = data;
            if (datarol[0].privilegio.includes(roles[0])) {
                return next();
            }
            else {
                throw new Error('Acceso prohibido. No tienes permisos para acceder a este recurso.');
            }
        }
        catch (error) {
            next(error);
        }
    };
}
async function contentToken(token) {
    try {
        if (!token) {
            throw new Error('Sesión no iniciada. Por favor, inicia sesión.');
        }
        if (!process.env.SECRETPASSJWT) {
            throw new Error('La variable de entorno SECRETEPASS no está definida.');
        }
        return jwt.verify(token, process.env.SECRETPASSJWT);
    }
    catch (error) {
        throw new Error('Token inválido o expirado.');
    }
}

module.exports = verifyToken;
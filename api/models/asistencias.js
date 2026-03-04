const fechaActual = require('../adicionales/fechaActual.js');

class Asistencias {

    conn;

    constructor(pool) {
        this.conn = pool
    }

    async asistencias() {
        const [rows, fields] = await this.conn.execute(`SELECT a.matriculaSoc, DATE_FORMAT(a.fechaEntrada, '%Y-%m-%d %H:%i:%s') AS fechaEntrada, l.nombres, l.apellidoP, l.apellidoM, l.seccion, DATE_FORMAT(l.fechaNacimiento, '%Y-%m-%d') AS fechaNacimiento FROM asistencia AS a INNER JOIN lista_alumnos AS l ON a.matriculaSoc = l.matriculaSoc`);
        return rows;
    }

    async Oneasistencias(mac) {
        const matri = mac;
        const [rows, fields] = await this.conn.execute('SELECT * FROM asistencia WHERE matriculaSoc = ? AND DATE(fechaEntrada) = CURDATE()', [matri]);
        return rows.length;
    }
    

    async crearasistencia(matriculaSoc) {
        const [rows, fields] = await this.conn.execute('INSERT INTO asistencia (matriculaSoc, fechaEntrada) VALUES (?, ?)', [matriculaSoc, fechaActual()]);
        return "New record created successfully";
    }

    async listaalumnos() {
        const [rows, fields] = await this.conn.execute(`SELECT id, matriculaSoc, nombres, apellidoP, apellidoM, grado, seccion, DATE_FORMAT(fechaNacimiento, '%Y-%m-%d') AS fechaNacimiento FROM lista_alumnos`);
        return rows;
    }

}

module.exports = Asistencias
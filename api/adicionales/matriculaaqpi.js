const conn = require('../connection/conn.js');

async function obtenerAlumnos() {
    const con = await conn();
    const [rows] = await con.execute("SELECT matriculaSoc FROM lista_alumnos ORDER BY matriculaSoc ASC");

    // Recorrer la lista e imprimir solo la matrícula
    rows.forEach(alumno => {
        console.log(alumno.matriculaSoc);
    });
}

// Ejecutar la función principal
obtenerAlumnos().catch(error => console.error(error));

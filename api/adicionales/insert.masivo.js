import conn from '../connection/conn.js';
import data from './newAlumnos-2025.js';


// async function dats(data) {
//     const con = await conn();

//     const [rows, fields] = await con.execute(data);
//     console.log('Datos afectados: ' + rows.affectedRows);
// }

// dats(data);


for (const alumno of data) {
const con = await conn();
  await con.execute(
    `INSERT INTO lista_alumnos 
      (matriculaSoc, nombres, apellidoP, apellidoM, grado, seccion, fechaNacimiento) 
     VALUES (?, ?, ?, ?, ?, ?,  STR_TO_DATE(?, '%m/%d/%Y'))`,
    [
      alumno.MATRICULA,
      alumno.NOMBRECOMPLETO,
      alumno.APELLIDOP,
      alumno.APELLIDOM,
      alumno.GRADO,
      alumno.SECCION,
      alumno.FECHANACIMIENTO
    ]
  );
}

console.log("Alumnos insertados correctamente ✅");
await connection.end();
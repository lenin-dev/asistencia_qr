const fs = require('fs');
const path = require('path');
const conn = require('../connection/conn.js');

async function obtenerAlumnos() {
    const con = await conn();
    const [rows] = await con.execute("SELECT nombres, apellidoP, apellidoM, matriculaSoc FROM lista_alumnos ORDER BY matriculaSoc ASC");
    return rows;
}

// Ruta donde se crearán las carpetas
const rutaDestino = './MATRICULAS'; // Modifica esta ruta a donde se crearán las carpetas
const rutaImagenes = './imagenes_qr'; // Ruta donde se encuentran las imágenes descargadas

// Función principal para crear carpetas y copiar imágenes
async function crearCarpetasYCopiarImagenes() {
    const alumnos = await obtenerAlumnos();

    alumnos.forEach((alumno, index) => {
        const carpetaNombre = path.join(rutaDestino, `${alumno.matriculaSoc}_${alumno.apellidoP}_${alumno.apellidoM}_${alumno.nombres}`);

        // Crear la carpeta si no existe
        if (!fs.existsSync(carpetaNombre)) {
            fs.mkdirSync(carpetaNombre);
            console.log(`Carpeta creada: ${carpetaNombre}`);
        } else {
            console.log(`La carpeta ya existe: ${carpetaNombre}`);
        }

        // Buscar y copiar la imagen correspondiente al índice del alumno
        const imagen = `${index}.png`; // Los nombres de las imágenes son números del 0 al 124 con extensión .jpg
        const origen = path.join(rutaImagenes, imagen);
        const destino = path.join(carpetaNombre, imagen);

        if (fs.existsSync(origen)) {
            fs.copyFileSync(origen, destino);
            console.log(`Imagen copiada: ${imagen} -> ${carpetaNombre}`);
        } else {
            console.log(`Imagen no encontrada: ${imagen}`);
        }
    });
}

// Ejecutar la función principal
crearCarpetasYCopiarImagenes().catch(error => console.error(error));

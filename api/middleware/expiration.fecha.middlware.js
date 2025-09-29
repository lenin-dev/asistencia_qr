const moment = require('moment-timezone');

function fechaExpiracion(fecha, expiracion) {
    const { tiempo, horario } = expiracion;
    const fechaHoraria = moment.tz(fecha, 'America/Mexico_City');
    const fechaSumada = fechaHoraria.clone().add(tiempo, horario); // CAMBIAR HORAS DE EXPIRACION 'hours'
    return fechaSumada.format();
}

function fechaLarga() {
    const fechaActual = moment.tz(new Date(), 'America/Mexico_City');
    const año = fechaActual.year();
    const mes = fechaActual.format('MM');
    const dia = fechaActual.format('DD');
    const hora = fechaActual.format('HH');
    const minutos = fechaActual.format('mm');
    const segundos = fechaActual.format('ss');
    const fechaYHoraFormateada = `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
    return fechaYHoraFormateada;
}

module.exports = {
    fechaExpiracion,
    fechaLarga
};
const joi = require('joi');

const matricula = joi.string().pattern(/^[A-Z 0-9]+$/, { invert: false }).min(6).max(10).trim();

const addmatricula = joi.object({
    matriculaSoc: matricula.required()
});

module.exports = addmatricula;
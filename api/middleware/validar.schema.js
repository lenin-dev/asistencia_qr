function validateDates(schema, property) {
    return (req, res, next) => {
        const date = req[property];
        const { error } = schema.validate(date);
        if(error) {
            next(error);
        } else {
            next();
        }
    }
}

module.exports = validateDates;

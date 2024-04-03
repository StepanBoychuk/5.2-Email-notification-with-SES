const Joi = require('joi');

const requestSchema = Joi.object({
    name: Joi.string().max(30).required(),
    email: Joi.string().email().required(),
    question: Joi.string().max(250).required()
});

module.exports = requestSchema
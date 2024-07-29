import Joi from 'joi'

const organizationNContact = Joi.object({
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  email: Joi.string()
    .max(100)
    .email({ tlds: { allow: false } })
    .required(),
  phone: Joi.string()
    .pattern(/^\d{1,11}$/)
    .required(),
  address1: Joi.string().max(100).required(),
  address2: Joi.string().max(100).required(),
  address3: Joi.string().max(100).required(),
  townRCity: Joi.string().max(100).required(),
  postcode: Joi.string().max(100).required(),
  dateOfBirth: Joi.date().iso().default('').allow('').optional(),
  typeOfDeveloper: Joi.string()
    .valid('Company', 'Individual', 'Public body')
    .default('')
    .allow('')
    .optional(),
  nationality: Joi.string()
    .valid('United Kingdom', 'United States', 'India')
    .default('')
    .allow('')
    .optional(),
  orgName: Joi.string().optional().default('').allow('')
})

export default organizationNContact

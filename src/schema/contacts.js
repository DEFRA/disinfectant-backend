import Joi from 'joi'

const contactsSchema = Joi.object({
  firstName: Joi.string().label('First Name').max(50).required(),
  lastName: Joi.string().label('Last Name').max(50).required(),
  email: Joi.string()
    .label('E-Mail ID')
    .max(100)
    .email({ tlds: { allow: false } })
    .required(),
  phone: Joi.string()
    .label('Telephone')
    .pattern(/^\d{1,11}$/)
    .required(),
  entity: Joi.string().label('Entity Name').valid('contact').required(),
  status: Joi.string()
    .label('Status')
    .valid('complete', 'incomplete')
    .required()
})

export default contactsSchema

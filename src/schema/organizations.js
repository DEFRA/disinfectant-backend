import Joi from 'joi'

const organizationsSchema = Joi.object({
  orgName: Joi.string()
    .label('Organization Name')
    .optional()
    .default('')
    .allow(''),
  address1: Joi.string().label('Address 1').max(100).required(),
  address2: Joi.string().label('Address 2').max(100).required(),
  address3: Joi.string().label('Address 3').max(100).required(),
  townRCity: Joi.string().label('Town/City').max(100).required(),
  postcode: Joi.string().label('Postal Code').max(100).required(),
  dateOfBirth: Joi.date()
    .label('Date of Birth')
    .iso()
    .default('')
    .allow('')
    .optional(),
  typeOfDeveloper: Joi.string()
    .label('Type of Developer')
    .valid('Company', 'Individual', 'Public body')
    .default('')
    .allow('')
    .optional(),
  nationality: Joi.string()
    .label('Nationality')
    .valid('United Kingdom', 'United States', 'India')
    .default('')
    .allow('')
    .optional(),
  entity: Joi.string()
    .label('Entity Name')
    .valid('contact', 'organization', 'upload')
    .required(),
  status: Joi.string()
    .label('Status')
    .valid('complete', 'incomplete')
    .required()
})

export default organizationsSchema

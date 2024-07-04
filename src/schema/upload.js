import Joi from 'joi'

const fileSchema = Joi.object({
  filename: Joi.string().label('File Name').required(),
  fileUrl: Joi.string().label('File URl').required()
})

const uploadSchema = Joi.object({
  file: fileSchema.required(),
  entity: Joi.string()
    .label('Entity Name')
    .valid('contact', 'organization', 'upload')
    .required(),
  status: Joi.string()
    .label('Status')
    .valid('complete', 'incomplete')
    .required()
})

export default uploadSchema

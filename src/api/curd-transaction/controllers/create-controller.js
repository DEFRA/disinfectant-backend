import { mongoCollections, schemaMapping } from '~/src/helpers/constants'
import { createDocument } from '~/src/helpers/databaseTransaction'
import Joi from 'joi'

const createController = {
  handler: async (request, h) => {
    const { value } = request.payload
    const entity  = "disinfectantApprovedList"
    const { collection } = request.params
    try {
      const schema = Joi.array().items(schemaMapping[entity]);
      const validationResult = schema.validate(value,{abortEarly:false});
      if (validationResult?.error) {
        const errorDetails = buildErrorDetails(validationResult?.error?.details)
        request.logger.info(
          `Create document validation error: ${JSON.stringify(errorDetails)}`
        )
        return h.response({ error: errorDetails }).code(400)
      }

      const collections = mongoCollections[collection]
      const document = await createDocument(request.db, collections, request.payload)
      return h.response({ message: 'success', document }).code(201)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export default createController
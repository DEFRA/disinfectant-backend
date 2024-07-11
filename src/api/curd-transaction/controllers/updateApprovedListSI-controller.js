import Joi from '~/node_modules/joi/lib/index'
import { buildErrorDetails } from '~/src/helpers/build-error-details'
import { mongoCollections, schemaMapping } from '~/src/helpers/constants'
import { updateDocumentInArray } from '~/src/helpers/databaseTransaction'

const updateApprovedListSIController = {
  handler: async (request, h) => {
    const { entity, value } = request.payload
    const { collection } = request.params
    try {
      const schema = Joi.array().items(schemaMapping[entity]);
      const validationResult = schema.validate(value,{abortEarly:false});
      if (validationResult?.error) {
        const errorDetails = buildErrorDetails(validationResult?.error?.details)
        request.logger.info(
          `Update document validation error: ${JSON.stringify(errorDetails)}`
        )
        return h.response({ error: errorDetails }).code(400)
      }
      const document = await updateDocumentInArray(
        request.db,
        mongoCollections[collection],
        request.payload
      )
      return h.response({ message: 'success', document }).code(201)
    } catch (error) {
      request.logger.info(`Create document error: ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export default updateApprovedListSIController
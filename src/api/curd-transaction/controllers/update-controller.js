import { buildErrorDetails } from '~/src/helpers/build-error-details'
import { mongoCollections, schemaMapping } from '~/src/helpers/constants'
import { updateDocument } from '~/src/helpers/databaseTransaction'

const updateController = {
  handler: async (request, h) => {
    const { entity, ...payload } = request.payload
    const { id, collection } = request.params
    try {
      const validationResult = schemaMapping[entity].validate(request.payload, {
        abortEarly: false
      })
      if (validationResult?.error) {
        const errorDetails = buildErrorDetails(validationResult?.error?.details)
        request.logger.info(
          `Update document validation error: ${JSON.stringify(errorDetails)}`
        )
        return h.response({ error: errorDetails }).code(400)
      }
      const document = await updateDocument(
        request.db,
        mongoCollections[collection],
        id,
        payload
      )
      return h.response({ message: 'success', document }).code(201)
    } catch (error) {
      request.logger.info(`Create document error: ${error}`)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export default updateController

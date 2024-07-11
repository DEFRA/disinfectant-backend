import { mongoCollections, schemaMapping } from '~/src/helpers/constants'
import { createDocument } from '~/src/helpers/databaseTransaction'

const createController = {
  handler: async (request, h) => {
    const { entity, ...payload } = request.payload
    try {
      const { error } = schemaMapping[entity].validate(request.payload)
      if (error) {
        return h.response({ error: error.details[0].message }).code(400)
      }
      const collection = mongoCollections[request.params?.collection]
      const document = await createDocument(request.db, collection, payload)
      return h.response({ message: 'success', document }).code(201)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export default createController
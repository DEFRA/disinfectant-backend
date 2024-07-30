import { ObjectId } from 'mongodb'
import { mongoCollections } from '~/src/helpers/constants'
import { readDocument } from '~/src/helpers/databaseTransaction'

const readController = {
  handler: async (request, h) => {
    const { id, collection } = request.params
    try {
      const document = await readDocument(
        request.db,
        mongoCollections[collection],
        {
          _id: new ObjectId(id)
        }
      )

      if (document) {
        return h.response({ message: 'success', document }).code(200)
      } else {
        return h.response({ error: 'Document not found' }).code(404)
      }
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export default readController

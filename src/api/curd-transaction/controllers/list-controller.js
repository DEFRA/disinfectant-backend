import { mongoCollections } from '~/src/helpers/constants'
import { readLatestCollection } from '~/src/helpers/databaseTransaction'

const listController = {
  handler: async (request, h) => {
    const { collection } = request.params
    try {
      const documents = await readLatestCollection(
        //  const documents = await readAllDocuments(
        request.db,
        mongoCollections[collection]
      )

      return h.response({ message: 'success', documents }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export default listController

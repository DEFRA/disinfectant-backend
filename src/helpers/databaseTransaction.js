import { ObjectId } from 'mongodb'
import { createLogger } from '~/src/helpers/logging/logger'

const logger = createLogger()

const createDocument = async (db, collectionName, document) => {
  try {
    const collection = db.collection(collectionName)
    const { acknowledged, insertedId } = await collection.insertOne(document)
    if (acknowledged && insertedId) {
      return await readDocument(db, collectionName, { _id: insertedId })
    }
  } catch (error) {
    logger.error(`Failed to create document in ${collectionName}: ${error}`)
    throw new Error('Failed to create document')
  }
}

const updateCollection = async (db, collectionName, id, document) => {
  try {
    const collection = db.collection(collectionName)
    const currentTime = new Date(Date.now())

    const matchedCount = await collection.updateOne(
      {
        _id: new ObjectId(id)
      },
      { $set: { lastModifiedDateAndTime: currentTime, deltaLink: document } }
    )
    if (matchedCount) {
      return await readDocument(db, collectionName, { _id: new ObjectId(id) })
    } else {
      logger.error(
        `Failed to find the document in ${collectionName} with ${id}`
      )
      throw new Error('Failed to find the document')
    }
  } catch (error) {
    logger.error(
      `Failed to update document in ${collectionName} with ${id}: ${error}`
    )
    throw new Error('Failed to update document')
  }
}
const deleteOlderCollection = async (db, collectionName, id) => {
  try {
    const collection = db.collection(collectionName)
    await collection.deleteOne({
      _id: new ObjectId(id)
    })
  } catch (error) {
    logger.error(
      `Failed to update document in ${collectionName} with ${id}: ${error}`
    )
    throw new Error('Failed to update document')
  }
}
const readAllDocuments = async (db, collectionName) => {
  try {
    const collection = db.collection(collectionName)
    const result = await collection.find({}).toArray()
    return result
  } catch (error) {
    logger.error(
      `Failed to read all documents from ${collectionName}: ${error}`
    )
    throw new Error('Failed to read documents in readAllDocuments')
  }
}

const readDocument = async (db, collectionName, query) => {
  try {
    const collection = db.collection(collectionName)
    const result = await collection.findOne(query)
    return result
  } catch (error) {
    logger.error(`Failed to read document from ${collectionName}: ${error}`)
    throw new Error('Failed to read document from readDocument')
  }
}

const readOldCollection = async (db, collectionName) => {
  try {
    const collection = db.collection(collectionName)
    const result = await collection
      .find()
      .limit(1)
      .sort({ lastModifiedDateAndTime: 1 })
      .toArray()
    return result
  } catch (error) {
    logger.error(`Failed to read document from ${collectionName}: ${error}`)
    throw new Error('Failed to read document from readOldCollection')
  }
}
const readLatestCollection = async (db, collectionName) => {
  try {
    const collection = db.collection(collectionName)
    const result = await collection
      .find()
      .limit(1)
      .sort({ lastModifiedDateAndTime: -1 })
      .toArray()
    return result
  } catch (error) {
    logger.error(`Failed to read document from ${collectionName}: ${error}`)
    throw new Error('Failed to read document from readLatestCollection')
  }
}
const updateDocumentInArray = async (db, collectionName, payload) => {
  try {
    const collection = db.collection(collectionName)
    const { value } = payload // Extract the array from the payload

    // Create bulk operations for each item in the value array
    const bulkOps = value.map((item) => {
      return {
        updateOne: {
          filter: { dsf_approvalslistsiid: item.dsf_approvalslistsiid },
          update: { $set: item },
          upsert: true
        }
      }
    })

    // Execute the bulk operations
    const result = await collection.bulkWrite(bulkOps)

    if (result.ok) {
      // If successful, read all documents from the collection
      return await readAllDocuments(db, collectionName)
    } else {
      throw new Error('Failed to update documents')
    }
  } catch (error) {
    logger.error(`Failed to update documents in ${collectionName}: ${error}`)
    throw new Error('Failed to update documents')
  }
}

export {
  createDocument,
  readAllDocuments,
  readDocument,
  updateCollection,
  updateDocumentInArray,
  readLatestCollection,
  deleteOlderCollection,
  readOldCollection
}

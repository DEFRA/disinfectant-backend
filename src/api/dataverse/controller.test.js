import {
  syncData,
  readDataverseDeltaController,
  listDBController,
  readDataverseController,
  authController
} from '~/src/api/dataverse/controller'
import { getData } from '~/src/services/powerapps/dataverse'
import {
  createDocument,
  readAllDocuments,
  readOldCollection,
  deleteOlderCollection,
  readLatestCollection,
  updateCollection
} from '~/src/helpers/databaseTransaction'

// import { createLogger } from '~/src/helpers/logging/logger'
import { getAccessToken } from '~/src/services/powerapps/auth'

import { mongoCollections } from '~/src/helpers/constants'

jest.mock('~/src/services/powerapps/dataverse')
jest.mock('~/src/helpers/databaseTransaction')

jest.mock('~/src/services/powerapps/auth', () => ({
  getAccessToken: jest.fn()
}))

jest.mock('~/src/helpers/logging/logger', () => {
  return {
    createLogger: () => ({
      info: jest.fn(),

      error: jest.fn()
    })
  }
})

jest.mock('~/src/helpers/proxy-agent')
jest.mock('~/src/helpers/proxy-fetch')
jest.mock('~/src/helpers/constants')

const errorCode = 500
const successCode = 200
// const multipleStatusCode = 300

describe('syncData', () => {
  const mockError = new Error('Sync data failed')
  const mockRequest = { db: {} } // mock request object
  const mockCollections = 'DisinfectantApprovedListSI' // example collection name

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should sync data successfully', async () => {
    const mockApprovedDisinfectants = {
      value: [
        { dsf_chemicalgroups: 'Group 1; Group 2' },
        { dsf_chemicalgroups: 'Group 2; Group 3' }
      ],
      '@odata.deltaLink': 'mock-delta-link'
    }

    // Setup mock return values
    getData.mockResolvedValue(mockApprovedDisinfectants)
    readAllDocuments.mockResolvedValue([])
    createDocument.mockResolvedValue({})
    readOldCollection.mockResolvedValue([{ _id: 'oldCollectionId' }])
    deleteOlderCollection.mockResolvedValue({})

    await syncData('entity', mockRequest)

    // Check the function calls and arguments
    expect(getData).toHaveBeenCalledWith('entity')
    expect(readAllDocuments).toHaveBeenCalledWith(mockRequest, mockCollections)
    expect(createDocument).toHaveBeenCalledWith(
      mockRequest,
      mockCollections,
      expect.objectContaining({
        deltaLink: 'mock-delta-link',
        count: 2, // 2 items in mockApprovedDisinfectants.value
        chemicalGroups: ['Group 1', 'Group 2', 'Group 3'],
        disInfectants: expect.any(Array),
        lastModifiedDateAndTime: expect.any(Date)
      })
    )
  })

  test('Should handle error during sync data', async () => {
    getData.mockRejectedValue(mockError)

    await expect(syncData('entity', mockRequest)).rejects.toThrow(mockError)

    expect(getData).toHaveBeenCalledWith('entity')
    expect(readAllDocuments).not.toHaveBeenCalled()
    expect(createDocument).not.toHaveBeenCalled()
    expect(readOldCollection).not.toHaveBeenCalled()
    expect(deleteOlderCollection).not.toHaveBeenCalled()
  })
})

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return success response with token', async () => {
    const mockToken = 'mock-token'
    getAccessToken.mockResolvedValue(mockToken)

    const mockRequest = {}
    const mockH = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await authController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      message: 'success',
      token: mockToken
    })
    expect(mockH.code).toHaveBeenCalledWith(200)
  })

  test('should return error response with error object', async () => {
    const mockError = new Error('Some error')
    getAccessToken.mockRejectedValue(mockError)

    const mockRequest = {}
    const mockH = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    await authController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith({ error: mockError })
    expect(mockH.code).toHaveBeenCalledWith(500)
  })
})

describe('readDataverseDeltaController', () => {
  // let mockServer, logger, mockViewHandler, mockRequest
  let mockServer, mockRequest
  const mockH = {
    response: jest.fn().mockReturnValue({
      code: jest.fn()
    })
  }

  beforeEach(() => {
    // logger = createLogger() // Creating logger mock

    mockServer = {
      db: {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{ _id: '123', data: 'test' }])
          }),

          insertOne: jest.fn().mockResolvedValue({ insertedId: '123' }),

          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
        })
      }
    }

    mockRequest = {
      params: { entity: 'DisinfectantApprovedListSI' },

      db: mockServer.db
    }

    jest.clearAllMocks()
  })

  test('should handle delta sync job with updates in latest collection', async () => {
    const mockLatestCollection = [
      { deltaLink: 'mock-delta-link', _id: 'mock-collection-id' }
    ]
    const mockApprovedDisinfectants = {
      value: [],
      '@odata.deltaLink': 'mock-delta-link'
    }
    readLatestCollection.mockResolvedValue(mockLatestCollection)
    getData.mockResolvedValue(mockApprovedDisinfectants)
    updateCollection.mockResolvedValue('mock-update-collection-value')
    await readDataverseDeltaController.handler(mockRequest, mockH)
    expect(readLatestCollection).toHaveBeenCalledWith(
      mockRequest.db,
      mockRequest.params.entity
    )
    expect(getData).toHaveBeenCalledWith(mockLatestCollection[0].deltaLink)
    expect(updateCollection).toHaveBeenCalledWith(
      mockRequest.db,
      mockRequest.params.entity,
      mockLatestCollection[0]._id,
      mockApprovedDisinfectants['@odata.deltaLink']
    )
  })

  test('should handle delta sync job with updates in sync data', async () => {
    const mockLatestCollection = []
    const mockApprovedDisinfectants = {
      value: [
        { dsf_chemicalgroups: 'Group 1; Group 2' },
        { dsf_chemicalgroups: 'Group 2; Group 3' }
      ],
      '@odata.deltaLink': 'mock-delta-link'
    }
    readLatestCollection.mockResolvedValue(mockLatestCollection)
    getData.mockResolvedValue(mockApprovedDisinfectants)
    await readDataverseDeltaController.handler(mockRequest, mockH)
    expect(readLatestCollection).toHaveBeenCalledWith(
      mockRequest.db,
      mockRequest.params.entity
    )
  })

  test('should handle delta sync job without updates', async () => {
    const mockLatestCollection = []
    readLatestCollection.mockResolvedValue(mockLatestCollection)
    await readDataverseDeltaController.handler(mockRequest, mockH)
    expect(readLatestCollection).toHaveBeenCalledWith(
      mockRequest.db,
      mockRequest.params.entity
    )
  })

  test('should handle error during delta sync job', async () => {
    const mockError = new Error('Some error')
    readLatestCollection.mockRejectedValue(mockError)
    await expect(
      readDataverseDeltaController.handler(mockRequest, mockH)
    ).rejects.toThrow(mockError)
  })
})

describe('listDBController', () => {
  let mockRequest, mockServer

  const mockH = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  beforeEach(() => {
    mockServer = {
      db: {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{ _id: '123', data: 'test' }])
          }),

          insertOne: jest.fn().mockResolvedValue({ insertedId: '123' }),

          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
        })
      }
    }
    mockRequest = {
      params: { entity: 'DisinfectantApprovedListSI' },

      db: mockServer.db
    }
    jest.clearAllMocks()
  })

  test('should return success response with documents', async () => {
    const mockDocuments = [{ _id: '123', data: 'test' }]
    readLatestCollection.mockResolvedValue(mockDocuments)

    await listDBController.handler(mockRequest, mockH)

    expect(readLatestCollection).toHaveBeenCalledWith(
      mockRequest.db,
      mongoCollections[mockRequest.params.collection]
    )
    expect(mockH.response).toHaveBeenCalledWith({
      message: 'success',
      documents: mockDocuments
    })
    expect(mockH.code).toHaveBeenCalledWith(successCode)
  })

  test('should return error response with error message', async () => {
    const mockError = new Error('Some error')
    readLatestCollection.mockRejectedValue(mockError)

    await listDBController.handler(mockRequest, mockH)

    expect(readLatestCollection).toHaveBeenCalledWith(
      mockRequest.db,
      mongoCollections[mockRequest.params.collection]
    )
    expect(mockH.response).toHaveBeenCalledWith({
      error: mockError.message
    })
    expect(mockH.code).toHaveBeenCalledWith(errorCode)
  })
})

describe('readDataverseController', () => {
  let mockRequest, mockServer

  const mockH = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  beforeEach(() => {
    mockServer = {
      db: {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{ _id: '123', data: 'test' }])
          }),

          insertOne: jest.fn().mockResolvedValue({ insertedId: '123' }),

          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
        })
      }
    }
    mockRequest = {
      params: { entity: 'DisinfectantApprovedListSI' },

      db: mockServer.db
    }
    jest.clearAllMocks()
  })

  test('should handle successful sync data', async () => {
    const mockSyncDataResult = { success: {} }
    const result = await readDataverseController.handler(mockRequest, mockH)

    expect(mockH.response).toHaveBeenCalledWith(mockSyncDataResult)
    expect(result).toEqual(mockH.response())
  })

  test('should handle error during sync data', async () => {
    // const mockError = new Error('Sync data failed')
    const result = await readDataverseController.handler(mockRequest, mockH)
    expect(mockH.code).toHaveBeenCalledWith(errorCode)
    expect(result).toEqual(mockH.response())
  })
})

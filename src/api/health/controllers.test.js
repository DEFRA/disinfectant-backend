import {
  readDataverseController,
  syncData
} from '~/src/api/dataverse/controller'

import { createLogger } from '~/src/helpers/logging/logger'

// Mock the logger

jest.mock('~/src/helpers/logging/logger', () => {
  return {
    createLogger: () => ({
      info: jest.fn(),

      error: jest.fn()
    })
  }
})

// Mock the controller's internal functions

jest.mock('~/src/api/dataverse/controller', () => ({
  ...jest.requireActual('~/src/api/dataverse/controller'),

  syncData: jest.fn() // Properly mock syncData function
}))

describe('readDataverseController', () => {
  let mockServer, logger, mockViewHandler, mockRequest

  beforeEach(() => {
    logger = createLogger() // Creating logger mock

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

    mockViewHandler = {
      response: jest.fn().mockReturnThis(),

      code: jest.fn().mockReturnThis()
    }

    mockRequest = {
      params: { entity: 'dsf_approvalslistsis' },

      db: mockServer.db
    }

    jest.clearAllMocks()
  })

  test('should call syncData and log info correctly', async () => {
    syncData.mockResolvedValue('success') // Ensuring syncData is resolved successfully

    await readDataverseController.handler(mockRequest, mockViewHandler)

    expect(syncData).toHaveBeenCalledWith(
      mockRequest.params.entity,

      mockRequest.db
    )

    expect(logger.info).toHaveBeenCalled() // Just checking that logger.info is called without specific arguments
  })

  test('should handle errors and log them', async () => {
    const error = new Error('Sync failed')

    syncData.mockRejectedValue(error) // Ensuring syncData throws an error

    await readDataverseController.handler(mockRequest, mockViewHandler)

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Daily sync job  fails:'),

      expect.anything()
    )

    expect(mockViewHandler.code).toHaveBeenCalledWith(500) // Ensuring that the handler returns a 500 status code on error
  })
})

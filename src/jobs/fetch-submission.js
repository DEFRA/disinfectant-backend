// Import the createLogger function to set up logging
import { createLogger } from '../helpers/logging/logger'
// Import the jobManager to manage scheduled jobs
import { schedule } from 'node-cron'
import {
  readDataverseController,
  readDataverseDeltaController,
  readDeletedDataVerseController,
  readModifiedDataVerseController
} from '../api/dataverse/controller'
import { config } from '~/src/config'

// Create a logger instance for logging information
const logger = createLogger()

const disinfectantScheduler = async (server) => {
  try {
    logger.info({
      data: 'This call is from daily scheduler'
      //   jobs: jobManager.getJobs()
    })

    logger.info('Starting Disinfectant Scheduler')
    schedule(config.get('disinfectantSchedule'), async () => {
      const request = {
        params: { entity: 'dsf_approvalslistsis' },
        db: server.db
      }
      const h = {
        response: (responseObject) => responseObject
      }
      const responseData = await readDataverseController.handler(request, h)
      logger.info('This call is from daily scheduler' + responseData)
      // console.warn('working',responseData)
      // await readDataverseController.handler(request, h)
    })
    schedule(config.get('disinfectantDeltaSchedule'), async () => {
      const request = {
        params: { entity: 'deltaLink' },
        db: server.db
      }
      const h = {
        response: (responseObject) => responseObject
      }
      const responseData = await readDataverseDeltaController.handler(
        request,
        h
      )
      logger.info('This call is from 10 min job scheduler' + responseData)
      // await readDataverseDeltaController.handler(request, h)
      // console.log(responseData).
    })
    return {
      data: 'This call is from 10 min cron job scheduler'
      //   jobs: jobManager.getJobs()
    }
  } catch (error) {
    logger.info(error)
    throw error
  }
}

/**
 * Fetches submission data as part of a cron job scheduler.
 * Logs and returns a data object containing a message and the current jobs managed by the jobManager.
 * @returns {Object} - An object containing a message and the list of jobs.
 * @throws {Error} - Throws an error if the operation fails.
 */
const fetchSubmissions = async () => {
  try {
    logger.info({
      data: 'This is from cron job fetch submission scheduler'
      //   jobs: jobManager.getJobs()
    })
    logger.info('starting Disinfectant Scheduler')
    schedule(config.get('disinfectantSchedule'), async () => {
      const request = {
        params: { entity: 'dsf_approvalslistsis' }
        // db: server.db
      }
      const h = {
        response: (responseObject) => responseObject
      } // const responseData = await readDataverseController.handler(request, h)
      await readDataverseController.handler(request, h)
    })

    return {
      data: 'This is from cron job fetch scheduler'
      //   jobs: jobManager.getJobs()
    }
  } catch (error) {
    logger.error(error)
    throw error
  }
}

const getDeletedDisinfectants = async (server) => {
  try {
    logger.info({
      data: 'This is from cron job fetch deleted disinfectant'
      //   jobs: jobManager.getJobs()
    })
    logger.info('starting Deleted Disinfectant Scheduler')
    schedule(config.get('deleteddisinfectantSchedule'), async () => {
      const request = {
        params: { entity: 'dsf_deleteddisinfectantses' },
        db: server.db
      }
      const h = {
        response: (responseObject) => responseObject
      } // const responseData = await readDataverseController.handler(request, h)
      await readDeletedDataVerseController.handler(request, h)
    })

    return {
      data: 'This is from cron job fetch deleted disinfectants scheduler'
      //   jobs: jobManager.getJobs()
    }
  } catch (error) {
    logger.error(error)
    throw error
  }
}

const getModifiedDisinfectants = async (server) => {
  try {
    logger.info({
      data: 'This is from cron job fetch modified disinfectant'
      //   jobs: jobManager.getJobs()
    })
    logger.info('starting modified Disinfectant Scheduler')
    schedule(config.get('updateddisinfectantSchedule'), async () => {
      const request = {
        params: { entity: 'dsf_approvalslistsis' },
        db: server.db
      }
      const h = {
        response: (responseObject) => responseObject
      } // const responseData = await readDataverseController.handler(request, h)
      await readModifiedDataVerseController.handler(request, h)
    })

    return {
      data: 'This is from cron job fetch modified disinfectants scheduler'
      //   jobs: jobManager.getJobs()
    }
  } catch (error) {
    logger.error(error)
    throw error
  }
}

// Export the fetchSubmissions function for use in other modules
export {
  fetchSubmissions,
  disinfectantScheduler,
  getDeletedDisinfectants,
  getModifiedDisinfectants
}

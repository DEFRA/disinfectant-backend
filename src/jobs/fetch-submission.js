// Import the createLogger function to set up logging
import { createLogger } from '../helpers/logging/logger'
// Import the jobManager to manage scheduled jobs
import { schedule } from 'node-cron'
import {
  readDataverseController,
  readDataverseDeltaController
} from '../api/dataverse/controller'
import { config } from '~/src/config'

// Create a logger instance for logging information
const logger = createLogger()

const disinfectantScheduler = async (server) => {
  try {
    logger.info({
      data: 'This is from cron job scheduler'
      //   jobs: jobManager.getJobs()
    })

    logger.info('starting Disinfectant Scheduler')
    schedule(config.get('disinfectantSchedule'), async () => {
      const request = {
        params: { entity: 'dsf_approvalslistsis' },
        db: server.db
      }
      const h = {
        response: (responseObject) => responseObject
      }
      const responseData = await readDataverseController.handler(request, h)
      // console.warn('working',responseData)
      //await readDataverseController.handler(request, h)
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
      // await readDataverseDeltaController.handler(request, h)
      // console.log(responseData)
    })
    return {
      data: 'This is from cron job scheduler'
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
      data: 'This is from cron job scheduler'
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
      data: 'This is from cron job scheduler'
      //   jobs: jobManager.getJobs()
    }
  } catch (error) {
    logger.info(error)
    throw error
  }
}

// Export the fetchSubmissions function for use in other modules
export { fetchSubmissions, disinfectantScheduler }

import { handleResponse } from '~/src/helpers/fetchProxyWrapper'
import { proxyFetch } from '~/src/helpers/proxy-fetch'

const { createLogger } = require('~/src/helpers/logging/logger')

const logger = createLogger()

const sendGetRequestAsync = async (url, options) => {
  try {
    const response = await proxyFetch(url, options)
    return await handleResponse(response)
  } catch (error) {
    logger.error(`GET request failed: ${error.message}`)
    throw error
  }
}

const sendPostRequestAsync = async (url, options) => {
  try {
    const response = await proxyFetch(url, {
      ...options,
      method: 'POST'
    })
    return await handleResponse(response)
  } catch (error) {
    logger.error(`POST request failed: ${error.message}`)
    throw error
  }
}

export { sendGetRequestAsync, sendPostRequestAsync }

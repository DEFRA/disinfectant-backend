import { config } from '~/src/config'
import { getAccessToken } from './auth'
import { fetchProxyWrapper } from '~/src/helpers/fetchProxyWrapper'
import { createLogger } from '~/src/helpers/logging/logger'

const resourceUrl = config.get('dataverseUri')
const apiBaseUrl = `${resourceUrl}api/data/v9.1`
const logger = createLogger()

const getHeaders = async () => {
  const token = await getAccessToken()
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    Prefer: 'return=representation'
  }
}

const getData = async (entity) => {
  try {
    const headers = await getHeaders()
    const response = await fetchProxyWrapper(`${apiBaseUrl}/${entity}`, {
      headers
    })
    return response.body
  } catch (error) {
    logger.error(`Get Data failed: ${error.message}`)
    throw error
  }
}

const createData = async (entity, data) => {
  try {
    const headers = await getHeaders()
    const response = await fetchProxyWrapper(`${apiBaseUrl}/${entity}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    })
    return response.body
  } catch (error) {
    logger.error(`Create Data failed: ${error.message}`)
    throw error
  }
}

const updateData = async (entity, id, data) => {
  try {
    const headers = await getHeaders()
    const response = await fetchProxyWrapper(`${apiBaseUrl}/${entity}(${id})`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers
    })
    return response.body
  } catch (error) {
    logger.error(`Update Data failed: ${error.message}`)
    throw error
  }
}

const deleteData = async (entity, id) => {
  try {
    const headers = await getHeaders()
    await fetchProxyWrapper(`${apiBaseUrl}/${entity}(${id})`, {
      method: 'DELETE',
      headers
    })
    return { message: 'Data deleted successfully' }
  } catch (error) {
    logger.error(`Delete Data failed: ${error.message}`)
    throw error
  }
}

const createTable = async (tableDefinition) => {
  try {
    const headers = await getHeaders()
    const response = await fetchProxyWrapper(
      `${apiBaseUrl}/EntityDefinitions`,
      {
        method: 'POST',
        body: JSON.stringify(tableDefinition),
        headers
      }
    )
    return response.body
  } catch (error) {
    logger.error(`Create table Data failed: ${error.message}`)
    throw error
  }
}

const createColumn = async (tableName, columnDefinition) => {
  try {
    const headers = await getHeaders()
    const response = await fetchProxyWrapper(
      `${apiBaseUrl}/EntityDefinitions(LogicalName='${tableName}')/Attributes`,
      {
        method: 'POST',
        body: JSON.stringify(columnDefinition),
        headers
      }
    )
    return response.body
  } catch (error) {
    logger.error(`Create column Data failed: ${error.message}`)
    throw error
  }
}

const getEntityMetadata = async (entity) => {
  try {
    const headers = await getHeaders()
    const response = await fetchProxyWrapper(
      `${apiBaseUrl}/EntityDefinitions(LogicalName='${entity}')`,
      {
        method: 'POST',
        headers
      }
    )
    return response.body
  } catch (error) {
    logger.error(`Get Entity Meta Data failed: ${error.message}`)
    throw error
  }
}

export {
  getData,
  createData,
  updateData,
  deleteData,
  createTable,
  createColumn,
  getEntityMetadata
}

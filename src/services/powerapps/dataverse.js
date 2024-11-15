import { config } from '~/src/config'
import { getAccessToken } from './auth'
import { fetchProxyWrapper } from '~/src/helpers/fetchProxyWrapper'
import { createLogger } from '~/src/helpers/logging/logger'

const resourceUrl = config.get('dataverseUri')
const apiBaseUrl = `${resourceUrl}api/data/v9.1`
const logger = createLogger()

const additionaParameters = `?$select=dsf_disinfectantname,dsf_companyname,dsf_companyaddress,dsf_chemicalgroups,dsf_fm_approveddilution_formula,dsf_sv_approveddilution_formula,dsf_dp_approveddilution_formula,dsf_tb_approveddilution_formula,dsf_go_approveddilution_formula,dsf_approvalslistsiid`

const getHeaders = async () => {
  const token = await getAccessToken()
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    Prefer: 'return=representation,odata.track-changes'
    // 'Preference-Applied': 'return=representation,odata.track-changes'
  }
}

const getDeleteHeaders = async () => {
  const token = await getAccessToken()
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0'
    // 'Preference-Applied': 'return=representation,odata.track-changes'
  }
}

const getData = async (entity) => {
  try {
    const headers = await getHeaders()
    let response = {}
    if (entity === 'dsf_approvalslistsis') {
      response = await fetchProxyWrapper(
        `${apiBaseUrl}/${entity}${additionaParameters}`,
        {
          headers
        }
      )
    } else {
      response = await fetchProxyWrapper(`${entity}`, {
        headers
      })
    }
    return response.body
  } catch (error) {
    logger.error(`Get Data failed with error: ${error.message}`)
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
    logger.error(`Create Data failed with error: ${error.message}`)
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
    logger.error(`Update Data failed with error: ${error.message}`)
    throw error
  }
}

const deleteOlderCollection = async (entity, id) => {
  try {
    const headers = await getHeaders()
    await fetchProxyWrapper(`${apiBaseUrl}/${entity}(${id})`, {
      method: 'DELETE',
      headers
    })
    return { message: 'Data deleted successfully' }
  } catch (error) {
    logger.error(`Delete Data failed with error: ${error.message}`)
    throw error
  }
}

const getDeleteddata = async (entity) => {
  try {
    const today = new Date()
    const previousDate = new Date(today)
    const previousDateModified = new Date(today)
    previousDate.setDate(today.getDate() - 180)
    previousDateModified.setDate(today.getDate() - 30)
    const todayStr = today.toISOString()
    const previousStr = previousDate.toISOString()
    const additiondeleteParameters = `?$filter=dsf_deletiondate ge ${previousStr} and dsf_deletiondate le ${todayStr}&$select=dsf_disinfectantname`

    const headers = await getDeleteHeaders()
    let response = {}

    response = await fetchProxyWrapper(
      `${apiBaseUrl}/${entity}${additiondeleteParameters}`,
      {
        headers
      }
    )

    return response.body
  } catch (error) {
    logger.error(`Get Deleted Data failed with error: ${error.message}`)
    throw error
  }
}

const getModifieddata = async (entity) => {
  try {
    const today = new Date()
    const previousDate = new Date(today)
    const previousDateModified = new Date(today)
    previousDate.setDate(today.getDate() - 180)
    previousDateModified.setDate(today.getDate() - 30)
    const goLiveDate = new Date(today.getFullYear(), 10, 14).toISOString()
    const todayStr = today.toISOString()
    const previousDateModifiedstr = previousDateModified.toISOString()

    const additionupdateParameters = `?$filter=modifiedon ge ${goLiveDate} and modifiedon ge ${previousDateModifiedstr} and modifiedon le ${todayStr}&$select=dsf_disinfectantname`

    const headers = await getDeleteHeaders()
    let response = {}

    response = await fetchProxyWrapper(
      `${apiBaseUrl}/${entity}${additionupdateParameters}`,
      {
        headers
      }
    )

    return response.body
  } catch (error) {
    logger.error(`Get Modified Data failed with error: ${error.message}`)
    throw error
  }
}

export {
  getData,
  createData,
  updateData,
  deleteOlderCollection,
  getDeleteddata,
  getModifieddata
}

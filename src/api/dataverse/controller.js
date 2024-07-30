/* eslint-disable no-console */
import {

  mongoCollections
} from '~/src/helpers/constants'
import { proxyAgent } from '~/src/helpers/proxy-agent'

import { getAccessToken } from '~/src/services/powerapps/auth'
import {
  createDocument,
  readAllDocuments,
  readLatestCollection,
  readOldCollection,
  deleteOlderCollection,
  updateCollection
} from '~/src/helpers/databaseTransaction'
import {

  getData

} from '~/src/services/powerapps/dataverse'
// import { config } from '~/src/config/index'
import { proxyFetch } from '~/src/helpers/proxy-fetch'
import { createLogger } from '~/src/helpers/logging/logger'
import { processOptions } from './helpers/process-options'

// import { schedule } from 'node-cron'

const logger = createLogger()

const authController = {
  handler: async (request, h) => {
    try {
      const token = await getAccessToken()
      return h.response({ message: 'success', token }).code(200)
    } catch (error) {
      return h.response({ error }).code(500)
    }
  }
}

const testProxy = {
  handler: async (request, h) => {
    const proxyAgentObj = proxyAgent()
    try {
      const response = await proxyFetch('https://www.google.com', {
        method: 'GET'
      })
      if (response.status >= 200 && response.status < 300) {
        const text = await response.text()
        return h.response({ proxyAgentObj, text })
      } else {
        return h.response({
          message: 'Fetch failed',
          proxyAgentObj,
          status: response.status,
          error: response.statusText
        })
      }
    } catch (error) {
      return h.response({ message: 'error', proxyAgentObj, error })
    }
  }
}

const readDataverseController = {
  handler: async (request, h) => {
    try {
      const currentTime = new Date(Date.now())
      const { entity } = request.params
      logger.info('success scheduled job starts: ' + currentTime)
      const approvedDisinfectants = await getData(entity)
      // Code to get unique Chemical Groups
      const combinedChemicalGroups = approvedDisinfectants.value
        .filter((item) => item.dsf_chemicalgroups !== null)
        .map((item) => item.dsf_chemicalgroups.split(';').map(e => e.trim()))
        .reduce((acc, val) => acc.concat(val), [])
      const uniqueChemicalGroups = [
        ...new Set(
          combinedChemicalGroups.filter((value) => value.trim() !== '')
        )
      ]
      // console.log(uniqueChemicalGroups)
      // Code to update property name @odata.deltaLink to deltaLink
      approvedDisinfectants.deltaLink =
        approvedDisinfectants['@odata.deltaLink']
      delete approvedDisinfectants['@odata.deltaLink']
      approvedDisinfectants.count = approvedDisinfectants.value.length
      // const newJson=updatedJson
      approvedDisinfectants.chemicalGroups = uniqueChemicalGroups
      // console.log(newJson.val)
      // Code to update the properties name
      approvedDisinfectants.value.forEach((element) => {
        element.disInfectantName = element.dsf_disinfectantname
        delete element.dsf_disinfectantname
        element.companyName = element.dsf_companyname
        delete element.dsf_companyname
        element.companyAddress = element.dsf_companyaddress
        delete element.dsf_companyaddress
        element.chemicalGroups = element.dsf_chemicalgroups
        delete element.dsf_chemicalgroups
        element.fmdo = element.dsf_fm_approveddilution_formula
        delete element.dsf_fm_approveddilution_formula
        element.svdo = element.dsf_sv_approveddilution_formula
        delete element.dsf_sv_approveddilution_formula
        element.dop = element.dsf_dp_approveddilution_formula
        delete element.dsf_dp_approveddilution_formula
        element.tbo = element.dsf_tb_approveddilution_formula
        delete element.dsf_tb_approveddilution_formula
        element.go = element.dsf_go_approveddilution_formula
        delete element.dsf_go_approveddilution_formula
      })
      // Code to Update propert value to disInfectants
      approvedDisinfectants.disInfectants = approvedDisinfectants.value
      delete approvedDisinfectants.value
      approvedDisinfectants.lastModifiedDateAndTime = currentTime
      logger.info(
        'Json data from dataverse: ' + JSON.stringify(approvedDisinfectants)
      )
      console.log(approvedDisinfectants)
      // call the mongo db method to create the collection
      const collections = mongoCollections.disinfectantApprovedListSI
      const documentsRead = await readAllDocuments(request.db, collections)
      if (documentsRead.length < 2) {
        const document = await createDocument(
          request.db,
          collections,
          approvedDisinfectants
        )
        logger.info(
          'success creating the Mongo Collection: ' + JSON.stringify(document)
        )
      }
      else {
        const oldCollection = await readOldCollection(
          request.db,
          collections
        )

        const deleteOldCollectionvalue = await deleteOlderCollection(
          request.db,
          collections,
          oldCollection[0]._id
        )
        const newdocument = await createDocument(
          request.db,
          collections,
          approvedDisinfectants
        )
      }
      logger.info('success scheduled job ends: ' + currentTime)
      return h.response({ message: 'success', data: approvedDisinfectants }).code(200)
    } catch (error) {
      h.response({ error: error.message }).code(500)
    }
  }
}
const listDBController = {
  handler: async (request, h) => {
    const { collection } = request.params
    try {
      const documents = await readLatestCollection
        (

          request.db,
          mongoCollections[collection]
        )

      return h.response({ message: 'success', documents }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}
const readDataverseDeltaController = {
  handler: async (request, h) => {
    try {
      const currentTime = new Date(Date.now())
      // const { entity } = request.params
      // const collection = 'DisinfectantApprovedListSI'
      logger.info('success scheduled job starts: ' + currentTime)
      // call the mongo db method to create the collection
      const collectionsDeltaLink = mongoCollections.disinfectantApprovedListSI
      const latestCollection = await readLatestCollection(
        request.db,
        collectionsDeltaLink
      )
      const deltaLink = latestCollection[0].deltaLink
      const approvedDisinfectants = await getData(deltaLink)
      if (approvedDisinfectants.value.length == 0) {
        // Get Latest Collection

        const updateCollectionValue = await updateCollection(
          request.db,
          collectionsDeltaLink,
          latestCollection[0]._id,
          approvedDisinfectants['@odata.deltaLink']

        )
        //Update the properties of latest collection
        return h.response({ message: 'success', data: updateCollectionValue }).code(200)
      }
      else {
        const requestDb = {
          params: { entity: 'dsf_approvalslistsis' },
          db: request.db
        }
        const h = {
          response: (responseObject) => responseObject
        }
        // const responseData = await readDataverseController.handler(request, h)
        // console.warn('working',responseData)
        const newCollection = await readDataverseController.handler(requestDb, h);
        return h.response({ message: 'success', data: newCollection }).code(200)
        /*  const oldCollection = await readOldCollection(

            request.db,
            collectionsDeltaLink
          )
  
          const deleteOldCollectionvalue =await deleteOlderCollection(
            request.db,
            collectionsDeltaLink,
            oldCollection[0]._id
          )
          const { entity } = request.params
          
          const approvedDisinfectantsUpdated = await getData(entity)
          const combinedChemicalGroups = approvedDisinfectantsUpdated.value
        .filter((item) => item.dsf_chemicalgroups !== null)
        .map((item) => item.dsf_chemicalgroups.split(';').map(e=>e.trim()))
        .reduce((acc, val) => acc.concat(val), [])
      const uniqueChemicalGroups = [
        ...new Set(
          combinedChemicalGroups.filter((value) => value.trim() !== '')
        )
      ]
      // console.log(uniqueChemicalGroups)
      // Code to update property name @odata.deltaLink to deltaLink
      approvedDisinfectants.deltaLink =
        approvedDisinfectantsUpdated['@odata.deltaLink']
      delete approvedDisinfectantsUpdated['@odata.deltaLink']
      approvedDisinfectantsUpdated.count = approvedDisinfectantsUpdated.value.length
      // const newJson=updatedJson
      approvedDisinfectantsUpdated.chemicalGroups = uniqueChemicalGroups
      // console.log(newJson.val)
      // Code to update the properties name
      approvedDisinfectantsUpdated.value.forEach((element) => {
        element.disInfectantName = element.dsf_disinfectantname
        delete element.dsf_disinfectantname
        element.companyName = element.dsf_companyname
        delete element.dsf_companyname
        element.companyAddress = element.dsf_companyaddress
        delete element.dsf_companyaddress
        element.chemicalGroups = element.dsf_chemicalgroups
        delete element.dsf_chemicalgroups
        element.fmdo = element.dsf_fm_approveddilution_formula
        delete element.dsf_fm_approveddilution_formula
        element.svdo = element.dsf_sv_approveddilution_formula
        delete element.dsf_sv_approveddilution_formula
        element.dop = element.dsf_dp_approveddilution_formula
        delete element.dsf_dp_approveddilution_formula
        element.tbo = element.dsf_tb_approveddilution_formula
        delete element.dsf_tb_approveddilution_formula
        element.go = element.dsf_go_approveddilution_formula
        delete element.dsf_go_approveddilution_formula
      })
      // Code to Update propert value to disInfectants
      approvedDisinfectantsUpdated.disInfectants = approvedDisinfectantsUpdated.value
      delete approvedDisinfectantsUpdated.value
      approvedDisinfectantsUpdated.lastModifiedDateAndTime = currentTime
          const newdocument = await createDocument(
            request.db,
            collectionsDeltaLink,
            approvedDisinfectantsUpdated
          )
        }
      
      // Code to get unique Chemical Groups
      
         // Code to update property name @odata.deltaLink to deltaLink
      
    } catch (error) {
      h.response({ error: error.message }).code(500)
    }
  }*/
      }
    }
    catch (error) {
      h.response({ error: error.message }).code(500)

    }
  }
}
const readController = {
  handler: async (request, h) => {
    try {
      const { entity } = request.params
      // const collection = 'DisinfectantApprovedListSI'

      const approvedDisinfectants = await getData(entity)
      // Code to get unique Chemical Groups
      const combinedChemicalGroups = approvedDisinfectants.value
        .filter((item) => item.dsf_chemicalgroups !== null)
        .map((item) => item.dsf_chemicalgroups.split(';'))
        .reduce((acc, val) => acc.concat(val), [])
      const uniqueChemicalGroups = [
        ...new Set(
          combinedChemicalGroups.filter((value) => value.trim() !== '')
        )
      ]
      console.log(uniqueChemicalGroups)
      // Code to update property name @odata.deltaLink to deltaLink
      approvedDisinfectants.deltaLink =
        approvedDisinfectants['@odata.deltaLink']
      delete approvedDisinfectants['@odata.deltaLink']
      approvedDisinfectants.count = approvedDisinfectants.value.length
      // const newJson=updatedJson
      approvedDisinfectants.chemicalGroups = uniqueChemicalGroups
      // console.log(newJson.val)
      // Code to update the properties name
      approvedDisinfectants.value.forEach((element) => {
        element.disInfectantName = element.dsf_disinfectantname
        delete element.dsf_disinfectantname
        element.companyName = element.dsf_companyname
        delete element.dsf_companyname
        element.companyAddress = element.dsf_companyaddress
        delete element.dsf_companyaddress
        element.chemicalGroups = element.dsf_chemicalgroups
        delete element.dsf_chemicalgroups
        element.fmdo = element.dsf_fm_approveddilution_formula
        delete element.dsf_fm_approveddilution_formula
        element.svdo = element.dsf_sv_approveddilution_formula
        delete element.dsf_sv_approveddilution_formula
        element.dop = element.dsf_dp_approveddilution_formula
        delete element.dsf_dp_approveddilution_formula
        element.tbo = element.dsf_tb_approveddilution_formula
        delete element.dsf_tb_approveddilution_formula
        element.go = element.dsf_go_approveddilution_formula
        delete element.dsf_go_approveddilution_formula
      })
      // Code to Update propert value to disInfectants
      approvedDisinfectants.disInfectants = approvedDisinfectants.value
      delete approvedDisinfectants.value

      const currentTime = new Date(Date.now())
      approvedDisinfectants.lastModifiedDateAndTime = currentTime
      console.log(approvedDisinfectants)

      /*
        // call the mongo db method to create the collection
        const collections = mongoCollections.disinfectantApprovedListSI
        const documentsRead = await readAllDocuments(
             request.db,
             collections
           )
         if(documentsRead.length<=2) 
         {
          const document = await createDocument(request.db, collections, approvedDisinfectants)
         } */
      return h
        .response({ message: 'success', data: approvedDisinfectants })
        .code(200)
    } catch (error) {
      h.response({ error: error.message }).code(500)
    }
  }
}








export {
  authController,
  readDataverseController,
  listDBController,
  testProxy,
  readController,
  readDataverseDeltaController
}
/* eslint-enable no-console */

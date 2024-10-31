/* eslint-disable no-console */
import { mongoCollections } from '~/src/helpers/constants'

import { getAccessToken } from '~/src/services/powerapps/auth'
import {
  createDocument,
  readAllDocuments,
  readLatestCollection,
  readOldCollection,
  deleteOlderCollection,
  updateCollection,
  deleteCollection
} from '~/src/helpers/databaseTransaction'
import {
  getData,
  getDeleteddata,
  getModifieddata
} from '~/src/services/powerapps/dataverse'
// import { config } from '~/src/config/index'

import { createLogger } from '~/src/helpers/logging/logger'
const logger = createLogger()
const errorCode = 500
const successCode = 200

const odatadeltaLink = '@odata.deltaLink'
const authController = {
  handler: async (_request, h) => {
    try {
      const token = await getAccessToken()
      return h.response({ message: 'success', token }).code(successCode)
    } catch (error) {
      return h.response({ error }).code(errorCode)
    }
  }
}

const syncData = async (entity, request) => {
  const currentTime = new Date(Date.now())
  try {
    logger.info('syncData method is called')
    const approvedDisinfectants = await getData(entity)
    // Code to get unique Chemical Groups.
    const combinedChemicalGroups = approvedDisinfectants.value
      .filter((item) => item.dsf_chemicalgroups !== null)
      .map((item) => item.dsf_chemicalgroups.split(';').map((e) => e.trim()))
      .reduce((acc, val) => acc.concat(val), [])
    let uniqueChemicalGroups = [
      ...new Set(combinedChemicalGroups.filter((value) => value.trim() !== ''))
    ]
    uniqueChemicalGroups = uniqueChemicalGroups.sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    )
    // console.log(uniqueChemicalGroups)
    // Code to update property name @odata.deltaLink to deltaLink
    // const odatadeltaLink='@odata.deltaLink'
    approvedDisinfectants.deltaLink = approvedDisinfectants[odatadeltaLink]
    delete approvedDisinfectants[odatadeltaLink]
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
    // Code to Update property value to disInfectants
    approvedDisinfectants.disInfectants = approvedDisinfectants.value
    delete approvedDisinfectants.value
    approvedDisinfectants.lastModifiedDateAndTime = currentTime
    // logger.info('Json data from dataverse: ' + JSON.stringify(approvedDisinfectants))
    // console.log(approvedDisinfectants)
    // call the mongo db method to create the collection
    const collections = mongoCollections.disinfectantApprovedListSI
    const documentsRead = await readAllDocuments(request, collections)
    if (documentsRead.length < 2) {
      const document = await createDocument(
        request,
        collections,
        approvedDisinfectants
      )
      logger.info(
        'success creating the Mongo Collection: ',
        JSON.stringify(document)
      )
      return document
    } else {
      const oldCollection = await readOldCollection(request, collections)

      const deleteOldCollectionvalue = await deleteOlderCollection(
        request,
        collections,
        oldCollection[0]._id
      )
      logger.info('deleted the old collection', deleteOldCollectionvalue)
      const newdocument = await createDocument(
        request,
        collections,
        approvedDisinfectants
      )
      logger.info('Created the new collection', newdocument)
      return newdocument
    }
  } catch (error) {
    logger.error(`Sync data method fails:  + ${error.message} + ${currentTime}`)

    // logger.info('Sync data method fails: '+error.message + currentTime)
    // h.response({ error: error.message }).code(errorCode)
    throw error
  }
}

const readDataverseController = {
  handler: async (request, h) => {
    const currentTime = new Date(Date.now())
    try {
      logger.info('Daily Sync job starts: ' + currentTime)
      const { entity } = request.params
      const callSyncData = await syncData(entity, request.db)
      logger.info('Sync data method with values: ', callSyncData)
      return h.response({ success: callSyncData })
    } catch (error) {
      logger.error(
        `Daily sync job  fails: ' + ${error.message} + ${currentTime}`
      )
      return h.response({ error: error.message }).code(errorCode)
    }
  }
}
const listDBController = {
  handler: async (request, h) => {
    const { collection } = request.params
    try {
      const documents = await readLatestCollection(
        request.db,
        mongoCollections[collection]
      )

      return h.response({ message: 'success', documents }).code(successCode)
    } catch (error) {
      return h.response({ error: error.message }).code(errorCode)
    }
  }
}
const readDataverseDeltaController = {
  handler: async (request, h) => {
    const currentTime = new Date(Date.now())

    try {
      // const collection = 'DisinfectantApprovedListSI'
      logger.info('Delta Sync job starts: ' + currentTime)
      // call the mongo db method to create the collection
      const collectionsDeltaLink = mongoCollections.disinfectantApprovedListSI
      const latestCollection = await readLatestCollection(
        request.db,
        collectionsDeltaLink
      )
      if (latestCollection.length > 0) {
        const deltaLink = latestCollection[0].deltaLink
        const approvedDisinfectants = await getData(deltaLink)
        if (approvedDisinfectants.value.length === 0) {
          // Get Latest Collection

          const updateCollectionValue = await updateCollection(
            request.db,
            collectionsDeltaLink,
            latestCollection[0]._id,
            approvedDisinfectants[odatadeltaLink]
          )
          // Update the properties of latest collection

          logger.info(
            'Delta Sync job ends with updates in time and deltalink: ' +
              currentTime
          )
          return h.response({
            message:
              'Delta Sync job ends with updates in time and deltalink:' +
              updateCollectionValue
          })
        } else {
          const entityValue = 'dsf_approvalslistsis'

          const callSyncData = await syncData(entityValue, request.db)
          logger.info(
            'Delta Sync job ends with updates in collection: ',
            callSyncData
          )
          return h.response({
            message: 'Delta Sync job ends with updates in collection'
          })
        }
      } else {
        logger.info('Delta Sync job ends without update: ' + currentTime)
        return h.response({
          message: 'Delta Sync job ends without update:'
        })
      }
    } catch (error) {
      logger.error(
        `Delta Sync job ends with: ' + ${error.message} + ${currentTime}`
      )
      // return h.response({ error: error.message }).code(errorCode)
      throw error
    }
  }
}

const readDeletedDataVerseController = {
  handler: async (request, h) => {
    const currentTime = new Date(Date.now())
    try {
      logger.info('Deleted Data Import job starts: ' + currentTime)
      const { entity } = request.params
      const getDeletedDisinFectantData = await getDeleteddata(
        entity,
        request.db
      )

      const collections = mongoCollections.DisinfectantDeletedListSI

      let deletedDisinfectantsList =
        getDeletedDisinFectantData?.value?.map((item) => ({
          name: item.dsf_disinfectantname,
          id: item.dsf_deleteddisinfectantsid
        })) ?? []

      deletedDisinfectantsList = deletedDisinfectantsList.sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      const deletedCollection = {
        deletedDisinfectants: deletedDisinfectantsList,
        lastModifiedTime: currentTime
      }
      logger.info('Deleted data method with values: Mongo Operations')
      await deleteCollection(request.db, collections)

      await createDocument(request.db, collections, deletedCollection)
      logger.info(
        'Deleted data method with values: Mongo Operations ::: Collections dropped and created'
      )
      logger.info(
        'Deleted data method with values: ',
        getDeletedDisinFectantData
      )
      return h.response({ success: getDeletedDisinFectantData })
    } catch (error) {
      logger.error(
        `Deleted Data Import Job: + ${error.message} + ${currentTime}`
      )
      return h.response({ error: error.message }).code(errorCode)
    }
  }
}

const readModifiedDataVerseController = {
  handler: async (request, h) => {
    const currentTime = new Date(Date.now())
    try {
      logger.info('Modified Data Import job starts: ' + currentTime)
      const { entity } = request.params
      const getModifiedDisinFectantData = await getModifieddata(
        entity,
        request.db
      )

      const collections = mongoCollections.DisinfectantModifiedListSI

      let modifiedApprovalList =
        getModifiedDisinFectantData?.value?.map((item) => ({
          name: item.dsf_disinfectantname,
          id: item.dsf_deleteddisinfectantsid
        })) ?? []

      modifiedApprovalList = modifiedApprovalList.sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      const modifiedCollection = {
        modifiedApprovalCategories: modifiedApprovalList,
        lastModifiedTime: currentTime
      }
      logger.info('Modified data method with values: Mongo Operations')
      await deleteCollection(request.db, collections)

      await createDocument(request.db, collections, modifiedCollection)
      logger.info(
        'Modified data method with values: Mongo Operations ::: Collections dropped and created'
      )
      logger.info(
        'Modified data method with values: ',
        getModifiedDisinFectantData
      )
      return h.response({ success: getModifiedDisinFectantData })
    } catch (error) {
      logger.error(
        `Modified Data Import Job:  + ${error.message} + ${currentTime}`
      )
      return h.response({ error: error.message }).code(errorCode)
    }
  }
}

export {
  authController,
  readDataverseController,
  listDBController,
  readDataverseDeltaController,
  syncData,
  readDeletedDataVerseController,
  readModifiedDataVerseController
}
/* eslint-enable no-console */

/* eslint-disable no-console */
import {
  dataverseEntities,
  nationalityValues,
  typeOfDeveloperValues,
  creditSalesStatusValues,
  developerInterestDetails,
  wwtwValues,
  planningUseClassValues,
  mongoCollections
} from '~/src/helpers/constants'
import { proxyAgent } from '~/src/helpers/proxy-agent'
import organizationNContact from '~/src/schema/organizationNContact'
import developmentSite from '~/src/schema/developmentSite'
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
  createData,
  getData,
  getEntityMetadata,
  getOptionSetDefinition
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
      else{
        const oldCollection = await readOldCollection(
          request.db,
          collections
        )

        const deleteOldCollectionvalue =await deleteOlderCollection(
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
      // return h.response({ message: 'success', data: approvedDisinfectants }).code(200)
    } catch (error) {
      h.response({ error: error.message }).code(500)
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
      if(approvedDisinfectants.value.length ==0)
        {
          // Get Latest Collection

          const updateCollectionValue= await updateCollection(
            request.db,
            collectionsDeltaLink,
            latestCollection[0]._id,
            approvedDisinfectants['@odata.deltaLink']

          )
          //Update the properties of latest collection
         
        }
        else{
          const oldCollection = await readOldCollection(
            request.db,
            collectionsDeltaLink
          )
  
          const deleteOldCollectionvalue =await deleteOlderCollection(
            request.db,
            collectionsDeltaLink,
            oldCollection[0]._id
          )
          const newdocument = await createDocument(
            request.db,
            collectionsDeltaLink,
            approvedDisinfectants
          )
        }
      
      // Code to get unique Chemical Groups
      
         // Code to update property name @odata.deltaLink to deltaLink
      
    } catch (error) {
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

const getEntitySchema = {
  handler: async (request, h) => {
    try {
      const { entity } = request.params
      const schema = await getEntityMetadata(entity)
      return h.response({ message: 'success', data: schema }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

const postController = {
  handler: async (request, h) => {
    try {
      const {
        params: { entity },
        payload: entityData
      } = request
      await createData(entity, entityData)
      return h.response({ message: 'Save successfully' }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

const saveOrganizationNContact = {
  handler: async (request, h) => {
    const { error, value: payload } = organizationNContact.validate(
      request.payload,
      { abortEarly: false }
    )
    if (error) {
      return h
        .response({ error: error.details.map((detail) => detail.message) })
        .code(400)
    }
    try {
      const { contact, organization } = dataverseEntities
      const organizationPayload = {
        nm_residentialaddressline1: payload.address1,
        nm_residentialaddressline2: payload.address2,
        nm_residentialaddressline3: payload.address3,
        nm_residentialtownorcity: payload.townRCity,
        nm_residentialpostcode: payload.postcode,
        nm_dateofbirth: payload.dateOfBirth === '' ? null : payload.dateOfBirth,
        nm_typeofdeveloper:
          payload.typeOfDeveloper === ''
            ? null
            : typeOfDeveloperValues[payload.typeOfDeveloper],
        nm_organisationname: payload.orgName === '' ? null : payload.orgName
      }

      const contactPayload = {
        firstname: payload.firstName,
        lastname: payload.lastName,
        nm_telephonenumber: payload.phone,
        nm_email: payload.email,
        nm_Organisation: organizationPayload
      }

      const contactRecord = await createData(contact, contactPayload)
      if (
        contactRecord?.contactid &&
        contactRecord?._nm_organisation_value &&
        payload.nationality
      ) {
        await updateData(organization, contactRecord?._nm_organisation_value, {
          'nm_Nationality@odata.bind': `/nm_countries(${nationalityValues[payload.nationality]})`
        })
      }
      return h
        .response({ message: 'Save successfully', data: contactRecord })
        .code(201)
    } catch (error) {
      return h.response({ error }).code(500)
    }
  }
}

const saveDevelopmentSite = {
  handler: async (request, h) => {
    const { error, value: payload } = developmentSite.validate(
      request.payload,
      {
        // const { error } = developmentSite.validate(request.payload, {
        abortEarly: false
      }
    )
    if (error) {
      return h
        .response({ error: error.details.map((detail) => detail.message) })
        .code(400)
    }
    // return h.response(config)
    try {
      const { developmentSite } = dataverseEntities
      const developmentSitePayload = {
        nm_sitename: payload.siteName,
        nm_creditsalesstatus:
          payload.creditSalesStatus === ''
            ? null
            : creditSalesStatusValues(payload.creditSalesStatus), // value - correct
        'nm_DeveloperCompany@odata.bind': `/nm_organisations(${payload.developerCompany})`,
        'nm_DeveloperEmployee@odata.bind': `/contacts(${payload.developerEmployee})`,
        nm_thedevelopersinterestinthedevelopmentsite:
          payload.theDevelopersInterestInTheDevelopmentSite === ''
            ? null
            : developerInterestDetails(
                payload.theDevelopersInterestInTheDevelopmentSite
              ), // value 1 correct
        nm_thedeveloperistheapplicant:
          payload.theDeveloperIsTheApplicant === ''
            ? null
            : developerInterestDetails(payload.theDeveloperIsTheApplicant), // value 1 correct
        nm_wastewaterconnectiontype:
          payload.wasteWaterConnectionType === ''
            ? null
            : wwtwValues(payload.wasteWaterConnectionType),
        'nm_Catchment@odata.bind': `/nm_catchments(${payload.catchment})`,
        'nm_Subcatchment@odata.bind': `/nm_subcatchmentses(${payload.subCatchment})`,
        // 'nm_WasteWaterTreatmentWorksConnection@odata.bind': `/nm_wwtws(${payload.wasteWaterTreatmentWorksConnection})`,
        'nm_Round@odata.bind': `/nm_RecordRoundses(${payload.round})`,
        nm_planninguseclassofthisdevelopment:
          payload.planningUseClassOfThisDevelopment === ''
            ? null
            : planningUseClassValues(payload.planningUseClassOfThisDevelopment),
        nm_numberofunitstobebuilt: payload.numberOfUnitsToBeBuilt, // number correct
        nm_smedeveloper: payload.smeDeveloper === 'Yes' ? 1 : 0, // false
        'nm_LPAs@odata.bind': `/nm_lpas(${payload.lpas})`,
        nm_planningpermission: payload.planningPermission === 'Yes' ? 1 : 0, // true
        nm_phaseddevelopment: payload.phasedDevelopment === 'Yes' ? 1 : 0, // false
        nm_gridreference: payload.gridReference, // value correct
        nm_haveyouincludedamapoftheproposedredlineb:
          payload.haveYouIncludedTheProposedRedLineB === 'Yes'
            ? 930750000
            : 930750001, // value 930750000 Incorrect
        nm_enquirydaterecieved: payload.enquiryDateRecieved,
        nm_applicationreceivedtime: payload.applicationreceivedtime,
        nm_customerduediligencecheckneeded:
          payload.customerDueDiligenceCheckNeeded === 'Yes' ? 1 : 0, // false
        nm_urn: payload.urn,
        nm_folderpath: payload.folderPath
        // `/nm_catchments(${payload.catchment})` + '/' + payload.urn
      }
      logger.info('developmentSitePayload >> ' + developmentSitePayload)
      const developmentSiteRecord = await createData(
        developmentSite,
        developmentSitePayload
      )

      return h
        .response({ message: 'Save successfully', data: developmentSiteRecord })
        .code(201)
    } catch (error) {
      return error
      // return h.response({ error }).code(500)
    }
  }
}

const readOptionsController = {
  handler: async (request, h) => {
    try {
      const { entity } = request.params
      const options = await getOptionSetDefinition(entity)
      const optionsSet = await processOptions(
        options?.Options ?? null,
        'Value',
        'Label.UserLocalizedLabel.Label'
      )
      return h.response({ message: 'success', data: optionsSet }).code(200)
    } catch (error) {
      logger.error(error)
      return h.response({ error: error.message }).code(500)
    }
  }
}

const readEntityAsOptionsController = {
  handler: async (request, h) => {
    try {
      const { entity } = request.params
      const options = await getData(entity)
      const optionsSet = await processOptions(
        options?.value ?? null,
        'nm_countryid',
        'nm_name'
      )
      return h.response({ message: 'success', data: optionsSet }).code(200)
    } catch (error) {
      logger.error(error)
      return h.response({ error: error.message }).code(500)
    }
  }
}

export {
  authController,
  readDataverseController,
  postController,
  getEntitySchema,
  saveOrganizationNContact,
  saveDevelopmentSite,
  testProxy,
  readOptionsController,
  readEntityAsOptionsController,
  readController,
  readDataverseDeltaController
}
/* eslint-enable no-console */

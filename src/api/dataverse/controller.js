import {
    dataverseEntities,
    nationalityValues,
    typeOfDeveloperValues,
    creditSalesStatusValues,
    developerInterestDetails,
    wwtwValues,
    planningUseClassValues
  } from '~/src/helpers/constants'
  import { proxyAgent } from '~/src/helpers/proxy-agent'
  import organizationNContact from '~/src/schema/organizationNContact'
  import developmentSite from '~/src/schema/developmentSite'
  import { getAccessToken } from '~/src/services/powerapps/auth'
  import {
    createData,
    getData,
    getEntityMetadata,
    getOptionSetDefinition,
    updateData
  } from '~/src/services/powerapps/dataverse'
  // import { config } from '~/src/config/index'
  import { proxyFetch } from '~/src/helpers/proxy-fetch'
  import { createLogger } from '~/src/helpers/logging/logger'
  import { processOptions } from './helpers/process-options'
  
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
  
  const readController = {
    handler: async (request, h) => {
      try {
        const { entity } = request.params
        const accounts = await getData(entity)
        return h.response({ message: 'success', data: accounts }).code(200)
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
    readController,
    postController,
    getEntitySchema,
    saveOrganizationNContact,
    saveDevelopmentSite,
    testProxy,
    readOptionsController,
    readEntityAsOptionsController
  }
import { MongoClient } from 'mongodb'
import { mongoCollections } from '~/src/helpers/constants'
import {
  createDocument,
  readAllDocuments,
  readDocument
} from '~/src/helpers/databaseTransaction'

import config from '~/src/config'


const { disinfectantApprovedListSI } = mongoCollections

const sampleData = {
  "@odata.context": "https://org5d77c363.api.crm11.dynamics.com/api/data/v9.2/$metadata#dsf_approvalslistsis",
  "@odata.count": 34,
  "value": [
      {
          "_createdby_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "createdon": "2024-04-26T10:32:36Z",
          "_createdonbehalfby_value": null,
          "dsf_approvalslistsiid": "0abae34a-b803-ef11-9f89-000d3a0d05c9",
          "dsf_chemicalgroups": "Peracetic acid; Peroxymonosulphate",
          "dsf_companyaddress": "1 Skiddaw Road,Croft Business Park,Bromborough' Wirral,CH62 3RB",
          "dsf_companyname": "A W Test",
          "dsf_disinfectant": "AshTest1",
          "dsf_disinfectantname": "AshTest1",
          "dsf_disinfectanttype": 1,
          "dsf_dp_approveddilution": "11 * (02/05/2024)",
          "dsf_fm_approveddilution": "Approval suspended *",
          "dsf_go_approveddilution": "Approval suspended *",
          "dsf_identity": null,
          "dsf_parentdisinfectant": "AshTest1",
          "dsf_pform": "Powder",
          "dsf_pid": null,
          "dsf_sv_approveddilution": "11 * (29/04/2024)",
          "dsf_tb_approveddilution": "10 * (30/04/2024)",
          "dsf_tradenameordisinfectantname": "Yes",
          "importsequencenumber": null,
          "_modifiedby_value": "202b20b7-b295-ee11-be37-002248c764e7",
          "modifiedon": "2024-05-22T09:35:09Z",
          "_modifiedonbehalfby_value": null,
          "overriddencreatedon": null,
          "_ownerid_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "_owningbusinessunit_value": "94f729d4-d354-ee11-be6f-000d3a0cd97b",
          "_owningteam_value": null,
          "_owninguser_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "statecode": 0,
          "statuscode": 1,
          "timezoneruleversionnumber": null,
          "utcconversiontimezonecode": null,
          "versionnumber": 11087122,
          "@odata.etag": "W/\"11087122\""
      },
      {
          "_createdby_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "createdon": "2024-04-27T10:32:36Z",
          "_createdonbehalfby_value": null,
          "dsf_approvalslistsiid": "1bbae34a-b803-ef11-9f89-000d3a0d05c9",
          "dsf_chemicalgroups": "Formaldehyde; Glutaraldehyde",
          "dsf_companyaddress": "2 Some Road, Some Business Park, Some City, Some Country, ZIP",
          "dsf_companyname": "Company B",
          "dsf_disinfectant": "DisinfectantB",
          "dsf_disinfectantname": "DisinfectantB",
          "dsf_disinfectanttype": 2,
          "dsf_dp_approveddilution": "12 * (03/05/2024)",
          "dsf_fm_approveddilution": "Approval active *",
          "dsf_go_approveddilution": "Approval active *",
          "dsf_identity": null,
          "dsf_parentdisinfectant": "DisinfectantB",
          "dsf_pform": "Liquid",
          "dsf_pid": null,
          "dsf_sv_approveddilution": "12 * (30/04/2024)",
          "dsf_tb_approveddilution": "11 * (01/05/2024)",
          "dsf_tradenameordisinfectantname": "Yes",
          "importsequencenumber": null,
          "_modifiedby_value": "202b20b7-b295-ee11-be37-002248c764e7",
          "modifiedon": "2024-05-23T09:35:09Z",
          "_modifiedonbehalfby_value": null,
          "overriddencreatedon": null,
          "_ownerid_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "_owningbusinessunit_value": "94f729d4-d354-ee11-be6f-000d3a0cd97b",
          "_owningteam_value": null,
          "_owninguser_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "statecode": 0,
          "statuscode": 1,
          "timezoneruleversionnumber": null,
          "utcconversiontimezonecode": null,
          "versionnumber": 11087122,
          "@odata.etag": "W/\"11087122\""
      },
      {
          "_createdby_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "createdon": "2024-04-28T10:32:36Z",
          "_createdonbehalfby_value": null,
          "dsf_approvalslistsiid": "2cbae34a-b803-ef11-9f89-000d3a0d05c9",
          "dsf_chemicalgroups": "Chlorocresol; Hydrogen Peroxide",
          "dsf_companyaddress": "3 Another Road, Another Business Park, Another City, Another Country, ZIP",
          "dsf_companyname": "Company C",
          "dsf_disinfectant": "DisinfectantC",
          "dsf_disinfectantname": "DisinfectantC",
          "dsf_disinfectanttype": 3,
          "dsf_dp_approveddilution": "13 * (04/05/2024)",
          "dsf_fm_approveddilution": "Approval pending *",
          "dsf_go_approveddilution": "Approval pending *",
          "dsf_identity": null,
          "dsf_parentdisinfectant": "DisinfectantC",
          "dsf_pform": "Gel",
          "dsf_pid": null,
          "dsf_sv_approveddilution": "13 * (01/05/2024)",
          "dsf_tb_approveddilution": "12 * (02/05/2024)",
          "dsf_tradenameordisinfectantname": "Yes",
          "importsequencenumber": null,
          "_modifiedby_value": "202b20b7-b295-ee11-be37-002248c764e7",
          "modifiedon": "2024-05-24T09:35:09Z",
          "_modifiedonbehalfby_value": null,
          "overriddencreatedon": null,
          "_ownerid_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "_owningbusinessunit_value": "94f729d4-d354-ee11-be6f-000d3a0cd97b",
          "_owningteam_value": null,
          "_owninguser_value": "fb78a4cd-dc7f-ee11-8179-002248c6ac26",
          "statecode": 0,
          "statuscode": 1,
          "timezoneruleversionnumber": null,
          "utcconversiontimezonecode": null,
          "versionnumber": 11087122,
          "@odata.etag": "W/\"11087122\""
      }
  ]
};

const findAllDocuments = {
  handler: async (request, h) => {
    try {
      const entities = await readAllDocuments(request.db, disinfectantApprovedListSI)

      return h.response({ message: 'success', entities }).code(200)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

const findDocument = {
  handler: async (request, h) => {
    const { id } = request.params
    try {
      const entity = await readDocument(request.db, disinfectantApprovedListSI, {
        _id: id
      })

      if (entity) {
        return h.response({ message: 'success', entity }).code(200)
      } else {
        return h.response({ error: 'Entity not found' }).code(404)
      }
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

const saveDocument = {
  handler: async (request, h) => {
    // const { error, value: payload } = contactSchema.validate(request.payload)
    // if (error) {
    //   return h.response({ error: error.details[0].message }).code(400)
    // }
    try {
      const entity = await createDocument(request.db, disinfectantApprovedListSI, sampleData)
      return h.response({ message: 'success', entity }).code(201)
    } catch (error) {
      return h.response({ error: error.message }).code(500)
    }
  }
}

export { findAllDocuments, findDocument, saveDocument }
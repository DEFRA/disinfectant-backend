import contactsSchema from '../schema/contacts'
import organizationsSchema from '../schema/organizations'
import uploadSchema from '../schema/upload'

export const mongoCollections = {
  contact: 'Contact',
  submission: 'Submission'
}

export const schemaMapping = {
  contact: contactsSchema,
  organization: organizationsSchema,
  upload: uploadSchema
}

export const dataverseEntities = {
  contact: 'contacts',
  organization: 'nm_organisations',
  developmentSite: 'nm_developmentsites'
}

export const typeOfDeveloperValues = {
  Company: 930750000,
  Individual: 930750001,
  'Public body': 930750002
}

export const nationalityValues = {
  'United Kingdom': '7bbb6fa9-7fdc-ee11-904d-002248c8796d',
  'United States': '2f670df7-7fdc-ee11-904d-002248c87a10',
  India: 'dfb20ccd-7fdc-ee11-904d-002248c87a10'
}

export const creditSalesStatusValues = {
  'Application received': 930750000,
  Prioritisation: 930750011,
  'Cannot service': 930750007,
  'CDD Check': 930750010,
  'Unsigned certificate sent': 930750001,
  "Signed developer's declaration received": 930750002,
  'First stage payment': 930750008,
  'Planning application decision received': 930750003,
  'Second stage payment': 930750004,
  'Final certificate sent': 930750009,
  'Developer withdrawn': 930750005,
  'NE withdrawn': 930750012
}

export const developerInterestDetails = {
  Yes: 1,
  'NA - Information not provided by the applicant': 2,
  'NA - No historical data': 3,
  Other: 4
}

export const wwtwValues = {
  'Package treatment plant': 930750001,
  'Septic tank': 930750002,
  'NA - No hisWastewater treatment worktorical data': 930750000
}

export const planningUseClassValues = {
  'Use Class C2 – Residential Institutions': 930750000,
  'Use Class C2A – Secure residential institutions': 930750001,
  'Use Class C3 – Dwellinghouses': 930750002,
  'Use Class C4 – HMOs': 930750003,
  Other: 930750004
}

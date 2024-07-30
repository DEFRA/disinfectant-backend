import Joi from 'joi'

const developmentSite = Joi.object({
  siteName: Joi.string().max(50).required(),
  creditSalesStatus: Joi.string()
    .valid(
      'Application received',
      'Prioritisation',
      'Cannot service',
      'CDD check',
      'Unsigned certificate sent',
      "Signed developer's declaration received",
      'First stage payment',
      'Planning application decision received',
      'Second stage payment',
      'Final certificate sent',
      'Developer withdrawn',
      'NE withdrawn'
    )
    .default('')
    .allow('')
    .required(),
  developerCompany: Joi.string().max(50).required(),
  developerEmployee: Joi.string().max(50).required(),
  theDevelopersInterestInTheDevelopmentSite: Joi.string()
    .valid(
      'Freehold',
      'NA - Information not provided by the applicant',
      'NA - No historical data',
      'Other'
    )
    .default('')
    .allow('')
    .required(),
  theDeveloperIsTheApplicant: Joi.string()
    .valid(
      'Yes',
      'NA - Information not provided by the applicant',
      'NA - No historical data',
      'Other'
    )
    .default('')
    .allow('')
    .required(),
  wasteWaterConnectionType: Joi.string()
    .valid(
      'Package treatment plant',
      'Septic tank',
      'Wastewater treatment work'
    )
    .default('')
    .allow('')
    .required(),
  catchment: Joi.string().max(50).required(),
  subCatchment: Joi.string().max(50).required(),
  // wasteWaterTreatmentWorksConnection: Joi.string().max(50).required(),
  round: Joi.string().max(50).required(),
  planningUseClassOfThisDevelopment: Joi.string()
    .valid(
      'Use Class C2 – Residential Institutions',
      'Use Class C2A – Secure residential institutions',
      'Use Class C3 – Dwellinghouses',
      ',Use Class C4 – HMOs',
      'Other'
    )
    .default('')
    .allow('')
    .required(),
  numberOfUnitsToBeBuilt: Joi.string().max(14).required(),
  smeDeveloper: Joi.string()
    .valid('Yes', 'No')
    .default('')
    .allow('')
    .required(),
  lpas: Joi.string().max(50).required(),
  planningPermission: Joi.string()
    .valid('Yes', 'No')
    .default('')
    .allow('')
    .required(),
  phasedDevelopment: Joi.string()
    .valid('Yes', 'No')
    .default('')
    .allow('')
    .required(),
  gridReference: Joi.string().max(14).required(),
  haveYouIncludedTheProposedRedLineB: Joi.string()
    .valid('Yes', 'No')
    .default('')
    .allow('')
    .required(),
  enquiryDateRecieved: Joi.string().max(14).required(),
  applicationreceivedtime: Joi.string().max(14).required(),
  customerDueDiligenceCheckNeeded: Joi.string()
    .valid('Yes', 'No')
    .default('')
    .allow('')
    .required(),
  urn: Joi.string().max(14).required(),
  folderPath: Joi.string().max(50).required()
})

export default developmentSite

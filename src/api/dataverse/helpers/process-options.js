import { nestedPropertyValue } from './nested-property-value'

const processOptions = async (optionsData, valuePath, labelPath) => {
  if (!optionsData) {
    return [{ value: '', label: '--No records found--' }]
  }
  const optionsSet = []
  optionsData.forEach(async (option) => {
    const key = await nestedPropertyValue(option, valuePath)
    if (key) {
      const optionSet = {
        value: key,
        text: (await nestedPropertyValue(option, labelPath)) ?? 'No Label'
      }
      optionsSet.push(optionSet)
    }
  })
  return optionsSet
}

export { processOptions }

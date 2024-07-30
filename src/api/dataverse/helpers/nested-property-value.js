const nestedPropertyValue = async (data, path) => {
  return path.split('.').reduce((o, p) => (o ? o?.[p] : undefined), data)
}

export { nestedPropertyValue }

function failAction(request,_h, error) {
  request.logger.error(error, error.message)

  throw error
}

export { failAction }

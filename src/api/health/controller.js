/**
 * A generic health-check endpoint. Used by the platform to check if the service is up and handling requests.
 */
const healthController = {
  handler: (request, h) => h.response({ message: 'success' }).code(200)
}

export { healthController }

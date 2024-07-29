import path from 'path'
import hapi from '@hapi/hapi'
import { config } from '~/src/config'
import { router } from '~/src/api/router'
import { requestLogger } from '~/src/helpers/logging/request-logger'
import { failAction } from '~/src/helpers/fail-action'
import { secureContext } from '~/src/helpers/secure-context'
import { disinfectantScheduler } from '../jobs/fetch-submission'
import { mongoPlugin } from '../helpers/mongodb'

const isProduction = config.get('isProduction')

async function createServer() {
  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  await server.register(requestLogger)

  if (isProduction) {
    await server.register(secureContext)
  }

  // This plugin adds access to mongo by adding `db` to the server and request object.
  // Also adds an instance of mongoClient to just the server object.
   await server.register({ plugin: mongoPlugin, options: {} })

  await server.register(router)

  // call scheduler

  await disinfectantScheduler(server)

  return server
}

export { createServer }

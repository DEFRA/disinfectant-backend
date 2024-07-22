import { health } from '~/src/api/health'
import { example } from '~/src/api/example'
import { dataverse } from '~/src/api/dataverse'
import { disinfectantApprovedListSI } from '~/src/api/tests'
import { crud } from '~/src/api/curd-transaction/index'

const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here.
     // await server.register([example])
    // await server.register([dataverse])
      await server.register([dataverse, crud])
    }
  }
}

export { router }

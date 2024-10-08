import { health } from '~/src/api/health'
// import { example } from '~/src/api/example'
import { dataverse } from '~/src/api/dataverse'
// import { disinfectantApprovedListSI } from '~/src/api/tests'
const router = {
  plugin: {
    name: 'Router',
    register: async (server) => {
      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])
      await server.register([dataverse])
    }
  }
}

export { router }

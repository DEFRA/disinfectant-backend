import {
  findAllDocuments,
  findDocument,
  saveDocument
} from '~/src/api/tests/controller'

const disinfectantApprovedListSI = {
  plugin: {
    name: 'disinfectantApprovedListSI',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/disinfectantApprovedListSI',
          ...findAllDocuments
        },
        {
          method: 'GET',
          path: '/disinfectantApprovedListSI/{id}',
          ...findDocument
        },
        {
          method: 'POST',
          path: '/disinfectantApprovedListSI',
          ...saveDocument
        }
      ])
    }
  }
}

export { disinfectantApprovedListSI }

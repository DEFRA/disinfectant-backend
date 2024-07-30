import createController from './controllers/create-controller'
import listController from './controllers/list-controller'
import readController from './controllers/read-controller'
import updateController from './controllers/update-controller'
import updateApprovedListSIController from './controllers/updateApprovedListSI-controller'

const crud = {
  plugin: {
    name: 'crud',
    register: async (server) => {
      server.route([
     /*   {
          method: 'GET',
          path: '/list/{collection}',
          ...listController
        },*/
        {
          method: 'GET',
          path: '/read/{collection}/{id}',
          ...readController
        },
        {
          method: 'POST',
          path: '/create/{collection}',
          ...createController
        },
        {
          method: 'PUT',
          path: '/update/{collection}/{id}',
          ...updateController
        },
        {
          method: 'PUT',
          path: '/updateApprovedListSIController/{collection}',
          ...updateApprovedListSIController
        }
      ])
    }
  }
}

export { crud }

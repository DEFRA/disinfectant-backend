import {
  authController,

  testProxy,
 
  readDataverseController,
  readDataverseDeltaController,
  
} from '~/src/api/dataverse/controller'

const dataverse = {
  plugin: {
    name: 'dataverse',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/dataverse',
          ...authController
        },
        /*{
          method: 'GET',
          path: '/dataverse-read/{entity}',
          ...readController
        },*/
        {
          method: 'GET',
          path: '/dataverse-read/{entity}',
          ...readDataverseController
        },
        {
          method: 'GET',
          path: '/dataverse-readDeltaLink/{entity}',
          ...readDataverseDeltaController
        },
       
        {
          method: 'GET',
          path: '/test-proxy',
          ...testProxy
        }
       
       
      ])
    }
  }
}

export { dataverse }

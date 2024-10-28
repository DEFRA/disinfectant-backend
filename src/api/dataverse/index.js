import {
  authController,
  listDBController,
  readDataverseController,
  readDataverseDeltaController,
  readDeletedDataVerseController,
  readModifiedDataVerseController
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
        {
          method: 'GET',
          path: '/list/{collection}',
          ...listDBController
        },
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
          path: '/dataverse-readDeleteddata/{entity}',
          ...readDeletedDataVerseController
        },
        {
          method: 'GET',
          path: '/dataverse-readModifieddata/{entity}',
          ...readModifiedDataVerseController
        }
      ])
    }
  }
}

export { dataverse }

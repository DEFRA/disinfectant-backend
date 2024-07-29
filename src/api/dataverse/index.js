import {
  authController,
  getEntitySchema,
  postController,
  readController,
  saveOrganizationNContact,
  saveDevelopmentSite,
  testProxy,
  readOptionsController,
  readDataverseController,
  readDataverseDeltaController,
  readEntityAsOptionsController
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
          method: 'POST',
          path: '/dataverse-save/{entity}',
          ...postController
        },
        {
          method: 'POST',
          path: '/save-organization-contact',
          ...saveOrganizationNContact
        },
        {
          method: 'GET',
          path: '/entity-schema/{entity}',
          ...getEntitySchema
        },
        {
          method: 'POST',
          path: '/save-development-site',
          ...saveDevelopmentSite
        },
        {
          method: 'GET',
          path: '/test-proxy',
          ...testProxy
        },
        {
          method: 'GET',
          path: '/options-definition/{entity}',
          ...readOptionsController
        },
        {
          method: 'GET',
          path: '/entity-options/{entity}',
          ...readEntityAsOptionsController
        }
      ])
    }
  }
}

export { dataverse }

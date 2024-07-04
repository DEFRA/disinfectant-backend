import { ConfidentialClientApplication } from '@azure/msal-node'
import { config } from '~/src/config'
import { sendGetRequestAsync, sendPostRequestAsync } from './authProxyClient'

const tenantId = config.get('azTenantId')
const clientId = config.get('azClientId')
const clientSecret = config.get('azClientSecret')
const resourceUrl = config.get('dataverseUri')

const azConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    clientSecret
  },
  system: {
    networkClient: { sendGetRequestAsync, sendPostRequestAsync }
  }
}

const client = new ConfidentialClientApplication(azConfig)

const getAccessToken = async () => {
  const tokenRequest = {
    scopes: [`${resourceUrl}.default`]
  }
  try {
    const tokenResponse =
      await client.acquireTokenByClientCredential(tokenRequest)
    return tokenResponse?.accessToken
  } catch (error) {
    throw new Error('Failed to acquire token')
  }
}

export { getAccessToken }

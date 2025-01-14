'use strict'

const fs = require('fs-extra')
const path = require('path')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
chai.should()

const { OidcManager } = require('../../lib/authentication/oidc-manager')
const SolidHost = require('../../lib/solid-host')

const dbPath = path.resolve(__dirname, '../db/oidc')
const serverUri = 'https://example.com'

describe('OidcManager (integration tests)', () => {
  beforeEach(() => {
    fs.removeSync(dbPath)
    fs.mkdirpSync(dbPath)
  })

  after(() => {
    fs.removeSync(dbPath)
  })

  describe('fromServerConfig()', () => {
    it('should result in an initialized oidc object', () => {
      const serverUri = 'https://localhost:8443'
      const host = SolidHost.from({ serverUri })

      const saltRounds = 5
      const argv = {
        host,
        dbPath,
        saltRounds
      }

      const oidc = OidcManager.fromServerConfig(argv)

      expect(oidc.rs.defaults.query).to.be.true()
      expect(oidc.clients.store.backend.path.endsWith('db/oidc/rp/clients'))
      expect(oidc.provider.issuer).to.equal(serverUri)
      expect(oidc.users.saltRounds).to.equal(saltRounds)
    })
  })

  describe('loadProviderConfig()', () => {
    it('it should return a minimal config if no saved config present', () => {
      const config = {
        authCallbackUri: serverUri + '/api/oidc/rp',
        postLogoutUri: serverUri + '/goodbye',
        host: {},
        serverUri,
        providerUri: serverUri,
        dbPath
      }
      const oidc = OidcManager.from(config)

      const providerConfig = oidc.loadProviderConfig()
      expect(providerConfig.issuer).to.equal(serverUri)
      expect(providerConfig.keys).to.not.exist()
    })

    it('should attempt to load a previously saved provider config', () => {
      const config = {
        authCallbackUri: serverUri + '/api/oidc/rp',
        postLogoutUri: serverUri + '/goodbye',
        host: {},
        serverUri,
        providerUri: serverUri,
        dbPath
      }

      const oidc = OidcManager.from(config)

      oidc.initLocalRpClient = sinon.stub()

      return oidc.initialize()
        .catch(err => {
          console.error('Error during .initialize(): ', err)
        })
        .then(() => {
          const providerConfig = oidc.loadProviderConfig()

          expect(providerConfig.issuer).to.equal(serverUri)
          expect(providerConfig.authorization_endpoint).to.exist()
          expect(providerConfig.keys).to.exist()
          expect(oidc.initLocalRpClient).to.have.been.called()
        })
    }).timeout(20000)
  })
})

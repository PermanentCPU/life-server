var fs = require('fs-extra')
var path = require('path')
const OIDCProvider = require('@solid/oidc-op')
const dns = require('dns')
const from = require('from2')

const TEST_HOSTS = ['nic.localhost', 'tim.localhost', 'nicola.localhost']

const { initStorage } = require('../lib/server-config')
const LegacyResourceMapper = require('../lib/data-storage/ldp-backend-fs/legacy-resource-mapper')

function testStorage (host) {
  const mapper = LegacyResourceMapper.from({ host })
  return initStorage({ host, mapper })
}

function testAccountManagerOptions (host, options = {}) {
  const storage = testStorage(host)
  const accountStore = storage.accountStore
  return { host, accountStore, ...options }
}

function rm (file) {
  return fs.removeSync(path.join(__dirname, '/resources/' + file))
}

function cleanDir (dirPath) {
  fs.removeSync(path.join(dirPath, '.well-known/.acl'))
  fs.removeSync(path.join(dirPath, 'favicon.ico'))
  fs.removeSync(path.join(dirPath, 'favicon.ico.acl'))
  fs.removeSync(path.join(dirPath, 'index.html'))
  fs.removeSync(path.join(dirPath, 'index.html.acl'))
  fs.removeSync(path.join(dirPath, 'robots.txt'))
  fs.removeSync(path.join(dirPath, 'robots.txt.acl'))
}

function write (text, file) {
  return fs.writeFileSync(path.join(__dirname, '/resources/' + file), text)
}

function cp (src, dest) {
  return fs.copySync(
    path.join(__dirname, '/resources/' + src),
    path.join(__dirname, '/resources/' + dest))
}

function read (file) {
  return fs.readFileSync(path.join(__dirname, '/resources/' + file), {
    encoding: 'utf8'
  })
}

// Backs up the given file
function backup (src) {
  cp(src, src + '.bak')
}

// Restores a backup of the given file
function restore (src) {
  cp(src + '.bak', src)
  rm(src + '.bak')
}

// Verifies that all HOSTS entries are present
async function checkDnsSettings () {
  return Promise.all(TEST_HOSTS.map(hostname => {
    return new Promise((resolve, reject) => {
      dns.lookup(hostname, (error, ip) => {
        if (error || ip !== '127.0.0.1') {
          reject(error)
        } else {
          resolve(true)
        }
      })
    })
  }))
    .catch(() => {
      throw new Error(`Expected HOSTS entries of 127.0.0.1 for ${TEST_HOSTS.join()}`)
    })
}

/**
 * @param configPath {string}
 *
 * @returns {Promise<Provider>}
 */
async function loadProvider (configPath) {
  return Promise.resolve()
    .then(() => {
      const config = require(configPath)

      const provider = new OIDCProvider(config)

      return provider.initializeKeyChain(config.keys)
    })
}

function stringToStream (string) {
  return from(function (size, next) {
    // if there's no more content
    // left in the string, close the stream.
    if (!string || string.length <= 0) {
      return next(null, null)
    }

    // Pull in a new chunk of text,
    // removing it from the string.
    const chunk = string.slice(0, size)
    string = string.slice(size)

    // Emit "chunk" from the stream.
    next(null, chunk)
  })
}

module.exports = {
  backup,
  checkDnsSettings,
  cleanDir,
  cp,
  loadProvider,
  read,
  restore,
  rm,
  stringToStream,
  testAccountManagerOptions,
  testStorage,
  write
}

const fs = require('fs')
const path = require('path')
const validUrl = require('valid-url')
const { URL } = require('url')

module.exports = [
  {
    name: 'root',
    help: "Root folder to serve (default: './data')",
    question: 'Path to the folder you want to serve. Default is',
    default: './data',
    prompt: true,
    filter: (value) => path.resolve(value)
  },
  {
    name: 'port',
    help: 'SSL port to use',
    question: 'SSL port to run on. Default is',
    default: '8443',
    prompt: true
  },
  {
    name: 'serverUri',
    question: 'Solid server uri (with protocol, hostname and port)',
    help: "Solid server uri (default: 'https://localhost:8443')",
    default: 'https://localhost:8443',
    validate: validUri,
    prompt: true
  },
  {
    name: 'webid',
    help: 'Enable WebID authentication and access control (uses HTTPS)',
    flag: true,
    default: true,
    question: 'Enable WebID authentication',
    prompt: true
  },
  {
    name: 'mount',
    help: "Serve on a specific URL path (default: '/')",
    question: 'Serve Solid on URL path',
    default: '/',
    prompt: true
  },
  {
    name: 'config-path',
    question: 'Path to the config directory (for example: /etc/solid-server)',
    default: './config',
    prompt: true
  },
  {
    name: 'config-file',
    question: 'Path to the config file (for example: ./config.json)',
    default: './config.json',
    prompt: true
  },
  {
    name: 'db-path',
    question: 'Path to the server metadata db directory (for users/apps etc)',
    default: './.db',
    prompt: true
  },
  {
    name: 'auth',
    help: 'Pick an authentication strategy for WebID:',
    question: 'Select authentication strategy',
    type: 'list',
    choices: [
      'WebID-OpenID Connect'
    ],
    prompt: false,
    default: 'WebID-OpenID Connect',
    filter: (value) => {
      if (value === 'WebID-OpenID Connect') return 'oidc'
    },
    when: (answers) => {
      return answers.webid
    }
  },
  {
    name: 'useOwner',
    question: 'Do you already have a WebID?',
    type: 'confirm',
    default: false,
    hide: true
  },
  {
    name: 'owner',
    help: 'Set the owner of the storage (overwrites the root ACL file)',
    question: 'Your webid (to overwrite the root ACL with)',
    prompt: false,
    validate: function (value) {
      if (value === '' || !value.startsWith('http')) {
        return 'Enter a valid Webid'
      }
      return true
    },
    when: function (answers) {
      return answers.useOwner
    }
  },
  {
    name: 'ssl-key',
    help: 'Path to the SSL private key in PEM format',
    validate: validPath,
    prompt: true
  },
  {
    name: 'ssl-cert',
    help: 'Path to the SSL certificate key in PEM format',
    validate: validPath,
    prompt: true
  },
  {
    name: 'no-reject-unauthorized',
    help: 'Accept self-signed certificates',
    flag: true,
    default: false,
    prompt: false
  },
  {
    name: 'multiuser',
    help: 'Enable multi-user mode',
    question: 'Enable multi-user mode',
    flag: true,
    default: false,
    prompt: true
  },
  {
    name: 'secret',
    help: 'Secret used to sign the session ID cookie (e.g. "your secret phrase")',
    question: 'Session secret for cookie',
    default: 'random',
    prompt: false,
    filter: function (value) {
      if (value === '' || value === 'random') {
        return
      }
      return value
    }
  },
  {
    name: 'force-user',
    help: 'Force a WebID to always be logged in (useful when offline)'
  },
  {
    name: 'strict-origin',
    help: 'Enforce same origin policy in the ACL',
    flag: true,
    default: false,
    prompt: false
  },
  {
    name: 'useEmail',
    help: 'Do you want to set up an email service?',
    flag: true,
    prompt: true,
    default: false
  },
  {
    name: 'email-host',
    help: 'Host of your email service',
    prompt: true,
    default: 'smtp.gmail.com',
    when: (answers) => {
      return answers.useEmail
    }
  },
  {
    name: 'email-port',
    help: 'Port of your email service',
    prompt: true,
    default: '465',
    when: (answers) => {
      return answers.useEmail
    }
  },
  {
    name: 'email-auth-user',
    help: 'User of your email service',
    prompt: true,
    when: (answers) => {
      return answers.useEmail
    },
    validate: (value) => {
      if (!value) {
        return 'You must enter this information'
      }
      return true
    }
  },
  {
    name: 'email-auth-pass',
    help: 'Password of your email service',
    type: 'password',
    prompt: true,
    when: (answers) => {
      return answers.useEmail
    }
  },
  {
    // This property is packaged into an object for the server property in config.json
    name: 'server-info-name', // All properties with prefix server-info- will be removed from the config
    help: 'A name for your server (not required, but will be presented on your server\'s frontpage)',
    prompt: true,
    default: answers => new URL(answers.serverUri).hostname
  },
  {
    // This property is packaged into an object for the server property in config.json
    name: 'server-info-description', // All properties with prefix server-info- will be removed from the config
    help: 'A description of your server (not required)',
    prompt: true
  },
  {
    // This property is packaged into an object for the server property in config.json
    name: 'server-info-logo', // All properties with prefix server-info- will be removed from the config
    help: 'A logo that represents you, your brand, or your server (not required)',
    prompt: true
  },
  {
    name: 'support-email',
    help: 'The support email you provide for your users (not required)',
    prompt: false
  }
]

function validPath (value) {
  if (value === 'default') {
    return Promise.resolve(true)
  }
  if (!value) {
    return Promise.resolve('You must enter a valid path')
  }
  return new Promise((resolve) => {
    fs.stat(value, function (err) {
      if (err) return resolve('Nothing found at this path')
      return resolve(true)
    })
  })
}

function validUri (value) {
  if (!validUrl.isUri(value)) {
    return 'Enter a valid uri (with protocol)'
  }
  return true
}

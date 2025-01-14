'use strict'

// const Url = require('url')

class StorageManager {
  /**
   * @param host {SolidHost}
   * @param ldpStore {LdpStore}
   * @param accountStore {LdpStore} User Storage Account store. (Same as the ldp
   *   data store, for the moment.)
   * @param collectionManager {CollectionManager}
   */
  constructor ({ host, ldpStore, accountStore, collectionManager }) {
    this.host = host
    this.ldpStore = ldpStore
    this.accountStore = accountStore
    this.collectionManager = collectionManager
  }

  /**
   * Returns the storage backend for a given request target.
   *
   * @param target {LdpTarget}
   * @returns {LdpStore}
   */
  storeForTarget ({ target }) {
    // if (target.isGraph || target.isContainer) {
    //   return this.graphStore
    // }

    return this.ldpStore
  }

  /**
   * @param target {LdpTarget}
   * @returns {boolean}
   */
  isRemote (target) {
    // FIXME (need to deal with subdomains etc)
    // const { serverUri } = this.host
    // const { url } = target
    // return Url.parse(url).host.includes(Url.parse(serverUri).host)
    return false
  }
}

module.exports = {
  StorageManager
}

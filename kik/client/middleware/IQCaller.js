const utils = require('../util')
const Deferred = require('../events/Deferred')
const xml = require('@xmpp/xml')
const RESOURCE_PREFIX = "CAN"
module.exports = class IQCaller {
    constructor(kikSocket) {
        this.kikSocket = kikSocket
        this.handlers = new Map()
    }

    request(stanza) {
        if (!stanza.attrs.id) {
            stanza.attrs.id = utils.uuid()
        }
        const deferred = new Deferred()
        this.handlers.set(stanza.attrs.id, deferred)
        this.kikSocket.send(stanza)
        return deferred.promise
    }

    async onElement(el) {
        if (el.is('iq') && ['result', 'error'].includes(el.attrs.type)) {
            const deferred = this.handlers.get(el.attrs.id)
            if (!deferred) return false
            deferred.resolve(el)
            this.handlers.delete(el.attrs.id)
        }
    }
}
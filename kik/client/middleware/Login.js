const utils = require('../util')
const xml = require('@xmpp/xml')
const RESOURCE_PREFIX = "CAN"
module.exports = class LoginMiddleware {
    constructor(kikSocket) {
        this.kikSocket = kikSocket
        this.kikSocket.on('connected', () => {
            if (this.kikSocket.options.node) {
                const { username, password, node, domain, kik_version_info, device_id } = this.kikSocket.options
                this.kikSocket.write(this._generateNodeLogin({ username, password, node, domain, kik_version_info, device_id }))
            } else {
                this.kikSocket.write('<k anon="">')
            }
        })
    }

    async onElement(el) {
        if (el.is('k')) {
            if (el.attrs.ts) {
                // second login
                this.kikSocket.emit("online")
            } else {
                // first login
                const { username, password, kik_version_info, device_id, android_id } = this.kikSocket.options
                const request = this._generateLoginRequest({ username, password, kik_version_info, device_id, android_id })
                const response = await this.kikSocket.iqCaller.request(request)
                let query = response.getChild('query', 'jabber:iq:register')
                if (query) {
                    this.kikSocket.options.node = query.getChildText('node')
                    this.kikSocket.options.jid = `${this.kikSocket.options.node}@${this.kikSocket.options.domain}/` + RESOURCE_PREFIX + this.kikSocket.options.device_id
                    this.kikSocket.restart()
                }
            }
            return true
        }
        return false
    }


    _generateLoginRequest({ username, password, kik_version_info, device_id, android_id }) {
        const password_key = utils.key_from_password(username, password)
        const id = utils.uuid()
        const kik_version = kik_version_info["kik_version"]
        let requestMap = {
            'username': username,
            'passkey-u': password_key,
            'device-id': device_id,
            'install-referrer': 'utm_source=google-play&utm_medium=organic',
            'operator': '310260',
            'install-date': '1494078709023',
            'device-type': 'android',
            'brand': 'generic',
            'logins-since-install': '1',
            'version': kik_version,
            'lang': 'en_US',
            'android-sdk': '19',
            'registrations-since-install': '0',
            'prefix': RESOURCE_PREFIX,
            'android-id': android_id,
            'model': 'Samsung Galaxy S5 - 4.4.4 - API 19 - 1080x1920'
        }
        return xml('iq', { type: 'set', id }, xml('query', 'jabber:iq:register', Object.keys(requestMap).map(k => xml(k, {}, requestMap[k]))))

    }
    _generateNodeLogin({ username, password, node, domain, kik_version_info, device_id }) {

        let jid = `${node}@${domain}`
        let jid_with_resource = jid + "/" + RESOURCE_PREFIX + device_id
        const kik_version = kik_version_info["kik_version"]
        const timestamp = utils.make_kik_timestamp()
        const sid = utils.uuid()
        let signature = utils.build_signature(kik_version_info, timestamp, jid, sid)
        let cv = utils.build_cv(kik_version_info, timestamp, jid)

        let password_key = utils.key_from_password(username, password)
        const the_map = {
            'from': jid_with_resource, 'to': domain, 'p': password_key, 'cv': cv, 'v': kik_version,
            'sid': sid, 'n': '1', 'conn': 'WIFI', 'ts': timestamp, 'lang': 'en_US', 'signed': signature
        }
        let attrs = Object.keys(the_map).map(k => `${k}="${the_map[k]}"`).join(' ')
        return `<k ${attrs}>`
    }
}
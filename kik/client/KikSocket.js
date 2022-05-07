const tls = require('tls');
const EventEmitter = require('events')
const Parser = require('../parser/Parser')
const LoginMiddleware = require('./middleware/Login')
const IQCaller = require('./middleware/IQCaller')

class XmlSocket extends EventEmitter {
    constructor(options) {
        super()
        this.options = options
        this.first_connect = true
        this.iqCaller = new IQCaller(this)
        this.middlewares = [this.iqCaller, new LoginMiddleware(this)]

    }
    connect() {
        if (!(this.options.username && this.options.password)) {
            throw Error('Must add username and password')
        }
        console.log("Connecting");
        this.parser = new Parser()
        this.parser.on('element', this.onElement.bind(this))
        this.parser.on('start', this.onElement.bind(this))
        this.parser.on('error', (err) => {
            console.error("Parser error:", err);
        })
        this.socket = tls.connect(this.options.port, this.options.host, null, () => {
            console.log("Socket connected");
            this.emit('connected')
        })
        this.socket.on('data', this.onData.bind(this))
    }

    onData(data) {
        let dataStr = data.toString('utf8')
        // console.log("Received:", dataStr);
        //TODO better way
        // if (dataStr.startsWith('<k')) {
        //     dataStr += '</k>'
        // }
        this.emit('data', dataStr)
        this.parser.write(dataStr)
    }

    async onElement(el) {
        this.emit('stanza', el)
        for (let i = 0; i < this.middlewares.length; i++) {
            await this.middlewares[i].onElement(el)
        }
    }

    reconnect() {
    }

    restart() {
        this.socket.end()
        this.socket = null
        this.parser.end('</k>')
        this.parser = null
        return this.connect()
    }

    send(el) {
        return this.write(el.toString())
    }

    write(data) {
        console.log("Sent:", data);
        return this.socket.write(data)
        //TODO better way
        // if (data.startsWith('<k')) {
        //     data += '</k>'
        // }
        // this.parser.write(data)
    }
}

module.exports = XmlSocket
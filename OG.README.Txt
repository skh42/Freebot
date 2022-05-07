# Unofficial Kik Node.js client

A very basic client boilerplate implementation for Kik server.


Heavily inspired by [kik-bot-api-unofficial](https://github.com/tomer8007/kik-bot-api-unofficial), which is made with Python.

Some of the code for XMPP management is straight outta [xmpp.js](https://github.com/xmppjs/xmpp.js), an XMPP library for Javascript.

#
## Usage
Install the dependencies with `yarn`

Rename `.env.sample` to `.env` and edit it to add your username and password.

Edit `config.js` file to change `android_id` and `device_id` (And stick to them on subsequent logins on same account)

Edit `index.js` to your liking.

Run with `node .` or `npm start`

## Draft Doc

`index.js` should give you a basic idea of what you can do.

More examples to be added.

### API
- `KikSocket.on('stanza', (element)=>{})`: Called whenever we receive any stanza.
- `KikSocket.on('online', ()=>{})`: Called when the client is authenticated. 
- `KikSocket.iqCaller.request(element): Promise<element>`: Sends an `iq` stanza of type `get` or `set` to the server, and returns a promise of the response (an `iq` of type `result` or `error`)

## Dependencies ##
- [node-rsa](https://github.com/rzcoder/node-rsa): For generating RSA while authenticating.
- [ltx](https://github.com/xmppjs/ltx): For parsing XML.
- [@xmpp/xml](https://github.com/xmppjs/xmpp.js/tree/master/packages/xml): For reading/writing XMPP Elements.
- [uuid](https://github.com/kelektiv/node-uuid): Generating valid stanza IDs.
- [dotenv](https://github.com/motdotla/dotenv): To read environment variables from `.env` file
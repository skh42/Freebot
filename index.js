const Database = require("@replit/database")
"use strict";
const xml = require('@xmpp/xml')
const fs = require("fs");
let util = require("util");
let http = require("http");
const config = require('./config')
const KikSocket = require('./kik/client/KikSocket');


const socket = new KikSocket({
    username: process.env.KIK_USERNAME,
    password: process.env.KIK_PASSWORD,
   promptCaptchas: true,
    trackUserInfo: true,
    trackFriendInfo: true,
   version: 15.25,
    host: config.host,
    port: config.port,
    domain: config.domain,
    android_id: config.android_id,
    device_id: config.device_id,
    kik_version_info: config.kik_version_info
})

const iqCaller = socket.iqCaller

socket.on('online', () => {
    console.log("Successfully logged in as", socket.options.jid);
    getRoster()

})

socket.on("receivedroster", (groups, friends) => {
    console.log(groups);
    console.log(friends)
});
socket.on("receivedjidinfo", (users) => {
    console.log("We got peer info:");
    console.log(users)
});

socket.on('stanza', stanza => {
    console.log("Stanza:", stanza.toString());
})
socket.connect()
console.log(socket.connected);

async function getRoster() {
    const response = await iqCaller.request(xml('iq', { type: 'get' }, xml('query', { xmlns: 'jabber:iq:roster', p: '8' })))
    let query = response.getChild('query')
    let items = query.getChildren('item')
    let friends = items.map(item => ({ username: item.getChildText('username'), displayName: item.getChildText('display-name'), pic: item.getChildText('pic') }))
    console.log("Friends:", friends);
}
socket.on("connect", () => {
 
  socket.on("disconnect", () => {
  socket.connect();
});
  console.log(free);
 

                   ;

})
const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const uuidv1 = require('uuid/v1');

function build_hmac_key(kik_version_info) {
    const kik_version = kik_version_info["kik_version"]
    const apk_signature_hex = "308203843082026CA00302010202044C23D625300D06092A864886F70D0101050500308183310B3009060355" +
        "0406130243413110300E060355040813074F6E746172696F3111300F0603550407130857617465726C6F6F31" +
        "1D301B060355040A13144B696B20496E74657261637469766520496E632E311B3019060355040B13124D6F62" +
        "696C6520446576656C6F706D656E74311330110603550403130A43687269732042657374301E170D31303036" +
        "32343232303331375A170D3337313130393232303331375A308183310B30090603550406130243413110300E" +
        "060355040813074F6E746172696F3111300F0603550407130857617465726C6F6F311D301B060355040A1314" +
        "4B696B20496E74657261637469766520496E632E311B3019060355040B13124D6F62696C6520446576656C6F" +
        "706D656E74311330110603550403130A4368726973204265737430820122300D06092A864886F70D01010105" +
        "000382010F003082010A0282010100E2B94E5561E9A2378B657E66507809FB8E58D9FBDC35AD2A2381B8D4B5" +
        "1FCF50360482ECB31677BD95054FAAEC864D60E233BFE6B4C76032E5540E5BC195EBF5FF9EDFE3D99DAE8CA9" +
        "A5266F36404E8A9FCDF2B09605B089159A0FFD4046EC71AA11C7639E2AE0D5C3E1C2BA8C2160AFA30EC8A0CE" +
        "4A7764F28B9AE1AD3C867D128B9EAF02EF0BF60E2992E75A0D4C2664DA99AC230624B30CEA3788B23F5ABB61" +
        "173DB476F0A7CF26160B8C51DE0970C63279A6BF5DEF116A7009CA60E8A95F46759DD01D91EFCC670A467166" +
        "A9D6285F63F8626E87FBE83A03DA7044ACDD826B962C26E627AB1105925C74FEB77743C13DDD29B55B31083F" +
        "5CF38FC29242390203010001300D06092A864886F70D010105050003820101009F89DD384926764854A4A641" +
        "3BA98138CCE5AD96BF1F4830602CE84FEADD19C15BAD83130B65DC4A3B7C8DE8968ACA5CDF89200D6ACF2E75" +
        "30546A0EE2BCF19F67340BE8A73777836728846FAD7F31A3C4EEAD16081BED288BB0F0FDC735880EBD8634C9" +
        "FCA3A6C505CEA355BD91502226E1778E96B0C67D6A3C3F79DE6F594429F2B6A03591C0A01C3F14BB6FF56D75" +
        "15BB2F38F64A00FF07834ED3A06D70C38FC18004F85CAB3C937D3F94B366E2552558929B98D088CF1C45CDC0" +
        "340755E4305698A7067F696F4ECFCEEAFBD720787537199BCAC674DAB54643359BAD3E229D588E324941941E" +
        "0270C355DC38F9560469B452C36560AD5AB9619B6EB33705"

    const classes_dex_sha1_digest = kik_version_info["classes_dex_sha1_digest"]
    const source_bytes = "hello" + Buffer.from(apk_signature_hex).toString('utf8') + kik_version + classes_dex_sha1_digest + "bar"
    return crypto.createHash('sha1').update(source_bytes).digest('base64')
}

function make_kik_timestamp() {
    j = (new Date()).getTime()

    i1 = (-16777216 & j) >> 24
    i2 = (16711680 & j) >> 16
    i3 = (65280 & j) >> 8

    j2 = (30 & i1) ^ i2 ^ i3
    j3 = (224 & j) >> 5
    j4 = -255 & j

    if (j2 % 4 == 0)
        j3 = j3 // 3 * 3
    else
        j3 = j3 // 2 * 2

    return j4 | (j3 << 5) | j2
}

function uuid() {
    return uuidv1()
}

function key_from_password(username, password) {
    const PASS_SALT = "niCRwL7isZHny24qgLvy"
    const sha1_password = crypto.createHash('sha1').update(password).digest('hex')
    const salt = username.toLowerCase() + PASS_SALT
    const key = crypto.pbkdf2Sync(sha1_password, salt, 8192, 16, 'sha1').toString('hex')
    return key
}

function build_signature(kik_version_info, timestamp, jid, sid) {
    const private_key_pem = "-----BEGIN RSA PRIVATE KEY-----\nMIIBPAIBAAJBANEWUEINqV1KNG7Yie9GSM8t75ZvdTeqT7kOF40kvDHIp" +
        "/C3tX2bcNgLTnGFs8yA2m2p7hKoFLoxh64vZx5fZykCAwEAAQJAT" +
        "/hC1iC3iHDbQRIdH6E4M9WT72vN326Kc3MKWveT603sUAWFlaEa5T80GBiP/qXt9PaDoJWcdKHr7RqDq" +
        "+8noQIhAPh5haTSGu0MFs0YiLRLqirJWXa4QPm4W5nz5VGKXaKtAiEA12tpUlkyxJBuuKCykIQbiUXHEwzFYbMHK5E" +
        "/uGkFoe0CIQC6uYgHPqVhcm5IHqHM6/erQ7jpkLmzcCnWXgT87ABF2QIhAIzrfyKXp1ZfBY9R0H4pbboHI4uatySKc" +
        "Q5XHlAMo9qhAiEA43zuIMknJSGwa2zLt/3FmVnuCInD6Oun5dbcYnqraJo=\n-----END RSA PRIVATE KEY----- "
    const key = new NodeRSA(private_key_pem)
    let signature = `${jid}:${kik_version_info["kik_version"]}:${timestamp}:${sid}`
    signature = key.sign(signature, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return signature
}

function build_cv(kik_version_info, timestamp, jid) {
    let hmac_data = `${timestamp}:${jid}`
    let hmac_secret_key = build_hmac_key(kik_version_info)
    let cv = crypto.createHmac('sha1', hmac_secret_key)
        .update(hmac_data)
        .digest('hex')
    return cv
}

module.exports = {
    make_kik_timestamp,
    uuid,
    build_signature,
    build_cv,
    key_from_password
}
module.exports.ledPost = (s) => {
    const spacer = '　　　　　　　　'
    const data = {
        str: spacer + '【むくむくニュース】' + s,
    }

    const URL = process.env.led_url

    const request = require('request')
    const options = {
        uri: URL,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
        },
        form: data,
    }
    request.post(options, function (error, response, body) {
        if (error) {
            module.exports.postErrorToSlack(`[NEWS] send failed;${error.message}`)
        }
    })
}

module.exports.postErrorToSlack = (s) => {
    const request = require('request')
    const options = {
        uri: process.env.slack_hook,
        headers: {
            'Content-type': 'application/json',
        },
        json: {
            text: `[${__filename}: ${s}`,
        },
    }
    request.post(options, function (error, response, body) {})
}

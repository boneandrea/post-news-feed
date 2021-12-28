'use strict'

const request = require('request')
const https = require('https')
const http = require('http')
const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const axios = require('axios')

const { JSDOM } = require('jsdom')
const LED = require('./myLED')
const process_message = require('./process_message')
const util = require('util')
require('dotenv').config()

const parseXML = require('xml2js').parseString
const MAX_TRY = process.env.MAX_TRY

const config = {
    responseType: 'document',
}

const posix = require('posix')
posix.openlog('YahooNews', { cons: true, ndelay: true, pid: true }, 'local1')

const mylog = (...s) => {
    for (const i in s) {
        if (process.env.CRON_RUN) {
            LED.postErrorToSlack(s[i])
            posix.syslog('debug', s[i])
        }

        // 開発中の手動実行： CRON_RUN is set in crontab
        const stack = new Error().stack
        const msg = `[LOG:${stack.split('at ')[2].trim()}]`
        console.log(msg, s[i])
        posix.syslog('debug', s[i])
    }

    // log level:
    // posix.syslog('debug', 'debugmsg');
    // posix.syslog('info', 'infomsg');
    // posix.syslog('warning', 'warningmsg');
    // posix.syslog('err', 'errmsg');
}

const get_articles_xml = async (feedUrl, config) => axios.get(feedUrl, config)

const select_media_xml = async () => {
    const url = process.env.feed_url
    const config = {
        responseType: 'document',
    }
    const response = await axios.get(url, config)
    const data = response.data // data は Documentオブジェクト
    return data[Math.floor(Math.random() * data.length)].url
}

const getData = async (feedUrl) => {
    const articles = await get_articles_xml(feedUrl, config)

    return new Promise((res, rej) => {
        try {
            parseXML(articles.data, { trim: true }, (err, result) => {
                if (!result?.rss) {
                    mylog('corrupted xml')
                    rej(null)
                }

                if (!(result.rss.channel[0].item instanceof Array)) {
                    mylog('not array')
                    rej(null)
                    return
                }

                if (result.rss.channel[0].item) {
                    res(result.rss)
                } else {
                    rej(null)
                }
            })
        } catch (e) {
            mylog(e)
            mylog(`[NEWS1] ${e.message}`)
            mylog(`[NEWS1] send failed;${JSON.stringify(articles.data)}`)
            rej(null)
        }
    })
}

/**
 * SCANDAL、結成15周年イヤー第2弾作品「アイボリー」リリース＆MV公開(E-TALENTBANK)
 * 「爆イケ」横浜流星、佐野勇斗との先輩後輩交換ショットに反響「オフショ感最高」「尊すぎます」(E-TALENTBANK)
 *
 * 末尾の (E-TALENTBANK)を削除
 */

const create_message = (rss) => {
    if (!rss) {
        mylog('rss is null')
        return null
    }

    const title = rss.channel[0].title[0].replace(/ - .* - Yahoo!ニュース/, '')
    const items = process_message.remove_footer(rss.channel[0].item)

    if (!(items instanceof Array)) {
        mylog(rss)
        return null
    }

    if(!items.length){
        mylog('empty')
        return null
    }

    if (typeof items[0] === "string"){
        return title + ' : ' + items.join(' / ')
    }

    mylog('not string')
    return null
}

const send = (message) => {
    mylog(`${process.env.CRON_RUN ? '' : 'NOT'} SEND HTTP...`, message)

    if (process.env.CRON_RUN) {
        LED.ledPost(message)
    }
}

const main = async () => {
    let count = 0
    let success = false
    while (!success && count < MAX_TRY) {
        mylog(`try ${count}`)
        const feedUrl = await select_media_xml()
        await getData(feedUrl)
            .then((rss) => {
                const message = create_message(rss)
                if (!message) {
                    mylog('msg is null')
                    throw new Error('msg is null')
                }
                send(message)
                success = true
            })
            .catch((e) => {
                mylog(`OOP ${feedUrl}`)
                mylog(e?.response?.status)
            })

        count++
    }
}

try {
    main()
} catch (e) {
    mylog(`[NEWS2] ${e.message}`)
}
mylog('end')
posix.closelog()

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
const mylog = (s) => {
    LED.postErrorToSlack(s)
}

const get_articles = async (feedUrl, config) => axios.get(feedUrl, config)

const pickup_xml = async () => {
    //    const url = process.env.feed_url

    const config = {
        responseType: 'document',
    }
    const response = await axios.get(url, config)
    const data = response.data // data は Documentオブジェクト
    return data[Math.floor(Math.random() * data.length)].url
}

const getData = async (feedUrl) => {
    return new Promise((res, rej) => {
        const result = get_articles(feedUrl, config)
        res(result)
    })
}

const send = (rss) => {
    if (rss) {
        try {
            const title = rss.channel[0].title[0].replace(/ - .* - Yahoo!ニュース/, '')
            const items = process_message.remove_footer(rss.channel[0].item)

            if (typeof items.join(' / ') === 'string') {
                const ledMessage = title + ' : ' + items.join(' / ')
                LED.ledPost(ledMessage)
            } else {
                throw new Exception('not string')
            }
        } catch (e) {
            mylog(`[NEWS0] ${e.message}`)
            mylog(`[NEWS0] send failed;${JSON.stringify(rss)}`)
        }
    }
}

const SP = '　'
const main = async () => {
    let count = 0
    const feedUrl = 'https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json'
    const rss = await getData(feedUrl)
        .then((rss) => {
            const data = rss.data
            const _str =
                data[0].timeSeries[0].areas[0].area.name +
                SP +
                data[0].timeSeries[0].areas[0].weathers[0] +
                SP +
                data[0].timeSeries[0].areas[0].winds[0] +
                SP +
                data[0].timeSeries[0].areas[0].waves[0] +
                SP +
                '最低気温' +
                SP +
                data[1].tempAverage.areas[0].min +
                '度' +
                SP +
                '最高気温' +
                SP +
                data[1].tempAverage.areas[0].max +
                '度'

            const str = _str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
                return String.fromCharCode(s.charCodeAt(0) - 65248)
            })
            console.log(str)
            LED.ledPost('明日' + SP + '明日' + SP + '明日' + SP + str)
        })
        .catch((e) => {
            console.log(e)
        })
}

try {
    main()
} catch (e) {
    mylog(`[NEWS2] ${e.message}`)
}

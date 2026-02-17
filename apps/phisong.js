// import get from '../model/getdata.js'
import common from "../../../lib/common/common.js"
import Config from '../components/Config.js'
import logger from "../components/Logger.js"
import rizPluginBase from '../components/baseClass.js'
import fCompute from "../model/fCompute.js"
import getBanGroup from "../model/getBanGroup.js"
import getInfo from "../model/getInfo.js"
import picmodle from "../model/picmodle.js"
import send from "../model/send.js"

/**@import {botEvent} from '../components/baseClass.js' */

export class rizsong extends rizPluginBase {
    constructor() {
        super({
            name: 'riz-图鉴',
            dsc: 'rizline的图鉴功能',
            event: 'message',
            priority: 1000,
            rule: [
                {
                    reg: `^[#/](${Config.getUserCfg('config', 'cmdhead')})(\\s*)(曲|song).*$`,
                    fnc: 'song'
                },
            ]
        })

    }


    /**
     * 歌曲图鉴
     * @param {botEvent} e
     */
    async song(e) {

        if (await getBanGroup.get(e, 'song')) {
            send.send_with_At(e, '这里被管理员禁止使用这个功能了呐QAQ！')
            return false
        }

        let msg = e.msg.replace(/[#/](.*?)(曲|song)(\s*)/, "")
        msg = msg.replace(/\s+-p\s+([0-9]+)/, "")
        if (!msg) {
            send.send_with_At(e, `请指定曲名哦！\n格式：/${Config.getUserCfg('config', 'cmdhead')} song <曲名>`)
            return true
        }
        let ids = getInfo.fuzzysongsnick(msg)
        if (ids[0]) {
            if (!ids[1]) {
                send.send_with_At(e, await songInfo(ids[0], e))
            } else {
                this.choseMutiNick(e, ids, {}, async (e, id, options) => {
                    send.send_with_At(e, await songInfo(id, e));
                })
            }
        } else {
            send.send_with_At(e, `未找到${msg}的相关曲目信息QAQ\n如果想要提供别名的话请访问 /rizhelp 中的别名投稿链接嗷！`)
        }
        return true
    }

}

/**
 * 获取歌曲信息图片
 * @param {idString} id 
 * @param {botEvent} e
 * @returns 
 */
async function songInfo(id, e) {
    let infoData = getInfo.info(id);
    if (!infoData) {
        logger.error(`[riz-plugin] songInfo: 未找到id为${id}的歌曲信息`);
        return `发生未知错误QAQ！请回报管理员！`;
    }

    
    /**
     * @type {any}
     */
    const chart = []

    const keys = fCompute.objectKeys(infoData.chart)


    keys.forEach(level => {
        const item = infoData.chart[level]
        /** @type {{start: number, length: number, theme: import("../model/getInfo.js").themeColorArray}[]} */
        const challengeTimes = []
        const totTick = infoData.duration / 60 * infoData.BPM
        item.challengeTimes.forEach(time => {
            challengeTimes.push({
                start: time.start / infoData.duration * 100,
                length: (time.end - time.start) / infoData.duration * 100,
                theme: time.theme
            })
        })
        chart.push({
            level: level,
            diff: item.diff,
            charter: item.charter,
            hitCount: item.hitCount,
            combo: fCompute.getCombo(item.hitCount),
            rizHitCount: item.rizHitCount,
            score: 1e6 + item.rizHitCount * 100,
            maxRKS: fCompute.rks(120, item.diff, level, item.rizHitCount, item.rizHitCount, item.hitCount, item.hitCount),
            theme: item.theme,
            challengeTimes: challengeTimes,
        })
    })

    /**@type {any} */
    let data = {
        
        name: infoData.name,
        composer: infoData.composer,
        chap: infoData.chap,
        BPM: infoData.BPM,
        illustration: getInfo.getill(infoData.id),
        background: getInfo.getill(infoData.id),
        durationStr: fCompute.formatDuration(infoData.duration),
        illustrator: infoData.illustrator,
        chart: chart,
    };
    return await picmodle.common(e, 'atlas', data);
}

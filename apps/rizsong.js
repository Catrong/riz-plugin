// import get from '../model/getdata.js'
import { Config, logger, Version } from '../components/index.js'
import rizPluginBase from '../components/baseClass.js'
import fCompute from "../model/fCompute.js"
import getBanGroup from "../model/getBanGroup.js"
import getInfo from "../model/getInfo.js"
import picmodle from "../model/picmodle.js"
import send from "../model/send.js"
import { levelColors, MAX_DIFFICULTY } from '../model/constNum.js'

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
                {
                    reg: `^[#/](${Config.getUserCfg('config', 'cmdhead')})(\\s*)(定数表|table).*$`,
                    fnc: 'table'
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

    /**
     * 定数表
     * @param {botEvent} e
     */
    async table(e) {

        const msg = e.msg.replace(/[#/](.*?)(定数表|table)(\s*)/, "")
        if (!msg) {
            send.send_with_At(e, `请指定定数哦！\n格式：/${Config.getUserCfg('config', 'cmdhead')} table <定数>`)
            return true
        }

        let difficulty = Number(msg.match(/([0-9]+)/)?.[0])
        if (isNaN(difficulty)) {
            send.send_with_At(e, `请输入正确的定数哦！\n格式：/${Config.getUserCfg('config', 'cmdhead')} table <定数>`)
            return true
        }

        let plus = msg.includes('+');

        difficulty = Math.round(difficulty) + (plus ? 0.6 : 0);

        const MaxDif = Math.floor(MAX_DIFFICULTY);

        const data = {
            rizVer: Version.rizline,
            /**@type {Record<string, {dif: string, songs: { ill: string; level: levelKind; }[]}>} */
            dif: {},
            color: '#ffffff',
        }

        const EZP = 1;
        const HDP = Math.round(MaxDif / 4 * 2);
        const INP = Math.round(MaxDif / 4 * 3);
        const ATP = MaxDif;

        if (difficulty <= HDP) {
            data.color = interpolateHSV(levelColors.EZ, levelColors.HD, (difficulty - EZP) / (HDP - EZP));
        } else if (difficulty <= INP) {
            data.color = interpolateHSV(levelColors.HD, levelColors.IN, (difficulty - HDP) / (INP - HDP));
        } else if (difficulty <= ATP) {
            data.color = interpolateHSV(levelColors.IN, levelColors.AT, (difficulty - INP) / (ATP - INP));
        }

        for (let i = 0; i < (plus ? 5 : 6); i++) {
            const diff = (difficulty + i * 0.1).toFixed(1);
            const songsInfo = getInfo.info_by_difficulty[diff];
            /**
             * @type {{ ill: string; level: levelKind; }[]}
             */
            const songs = [];
            songsInfo?.forEach(song => {
                songs.push({
                    ill: getInfo.getill(song.id),
                    level: song.level,
                })
            })
            if (!songs.length) continue;
            data.dif[diff] = {
                dif: diff,
                songs: songs
            }
        }

        send.send_with_At(e, await picmodle.common(e, 'table', data))

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

/**
 * 辅助函数：十六进制转RGB
 * @param {string} hex 十六进制颜色值
 * @returns {{r: number, g: number, b: number}} RGB值
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * 辅助函数：RGB转十六进制
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns {string} 十六进制颜色值
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * RGB转HSV
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns 
 */
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0, s = max === 0 ? 0 : d / max;
    let v = max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h, s, v };
}

/**
 * HSV转RGB
 * @param {number} h 色相 (0-1)
 * @param {number} s 饱和度 (0-1)
 * @param {number} v 明度 (0-1)
 * @returns {{r: number, g: number, b: number}} RGB值
 */
function hsvToRgb(h, s, v) {
    let r = 0, g = 0, b = 0;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * HSV插值
 * @param {string} color1 颜色1 (十六进制)
 * @param {string} color2 颜色2 (十六进制)
 * @param {number} factor 插值因子 (0-1)
 * @returns {string} 插值后的颜色 (十六进制)
 */
function interpolateHSV(color1, color2, factor) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const hsv1 = rgbToHsv(rgb1.r, rgb1.g, rgb1.b);
    const hsv2 = rgbToHsv(rgb2.r, rgb2.g, rgb2.b);

    // 处理色相环绕
    let h1 = hsv1.h;
    let h2 = hsv2.h;

    if (Math.abs(h1 - h2) > 0.5) {
        if (h1 > h2) {
            h2 += 1;
        } else {
            h1 += 1;
        }
    }

    const h = (h1 + (h2 - h1) * factor) % 1;
    const s = hsv1.s + (hsv2.s - hsv1.s) * factor;
    const v = hsv1.v + (hsv2.v - hsv1.v) * factor;

    const rgb = hsvToRgb(h, s, v);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

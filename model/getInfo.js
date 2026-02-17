import readFile from './getFile.js'
import { DlcInfoPath, configPath, imgPath, infoPath, originalIllPath, ortherIllPath, oldInfoPath } from './path.js'
import path from 'path'
import Config from '../components/Config.js'
import fs from 'fs'
import { Level, MAX_DIFFICULTY } from './constNum.js'
import chokidar from 'chokidar'
import fCompute from './fCompute.js'
import logger from '../components/Logger.js'

/**
 * @typedef {Object} themeColorObject
 * @property {string} r red
 * @property {string} g green
 * @property {string} b blue
 * @property {string} a alpha
 * 
 * @typedef {[bg:themeColorObject, note:themeColorObject, health: themeColorObject]} themeColorArray
 * 
 * @typedef {Object} challengeTimesObject
 * @property {number} checkPoint 检查点，作用尚不明确。
 * @property {number} start 开始时刻，单位：tick
 * @property {number} end 结束时刻，单位：tick
 * @property {number} transTime 过渡时间（单位：秒）
 * 
 * @typedef {Object} bpmShiftsObject
 * @property {number} time 时间
 * @property {number} value 倍率
 * @property {number} easeType 0
 * @property {number} floorPosition 累计值（单位：秒），表示time时刻的累计偏移量
 * 
 */

/**
 * 
 * @typedef {Object} infoRizTimeObject
 * @property {number} start 开始时刻，单位：全局tick
 * @property {number} end 结束时刻，单位：全局tick
 * @property {themeColorArray} theme 主题
 * 
 * @typedef {Object} ChartInfoObject
 * @property {number} diff 难度数值
 * @property {string} charter 谱师
 * @property {themeColorArray} theme 主题
 * @property {number} hitCount 击打数
 * @property {number} rizHitCount riz时间内的击打数
 * @property {infoRizTimeObject[]} challengeTimes riztime列表
 * 
 * @typedef {Object} OriInfoObject
 * @property {idString} id 曲目id
 * @property {string} chap 章节
 * @property {songString} name 曲目名称
 * @property {string} composer 作曲者
 * @property {number} pst 预览起始时间
 * @property {number} pet 预览结束时间
 * @property {string} illustrator 画师
 * @property {number} BPM 曲目BPM
 * @property {bpmShiftsObject[]} bpmShifts BPM变速信息
 * @property {number} duration 曲目时长，单位：秒
 * @property {Record<levelKind, ChartInfoObject>} chart 谱面信息
 * 
 */
export default new class getInfo {

    constructor() {
        /**
         * 难度映射
         * @type {levelKind[]}
         */
        this.Level = Level

        /**
         * @type {string[]}
         * @description Tips
         */
        this.tips = []


        /**
         * @type {{[key:idString]:OriInfoObject}}
         * @description 原版信息
         */
        this.ori_info = {}
        /**
         * @type {{[key:idString]:songString}}
         * @description 通过id获取曲名
         */
        this.songsid = {}
        /**
         * @type {{[key:songString]:idString}}
         * @description 原曲名称获取id
         */
        this.idssong = {}

        /**
         * 按dif分的info
         * @type {Record<string, ChartInfoObject[]>}
         */
        this.info_by_difficulty = {}

        /**
         * 曲目id列表
         * @type {idString[]}
         */
        this.idList = []

        if (Config.getUserCfg('config', 'watchInfoPath')) {
            chokidar.watch(infoPath).on('change', () => {
                this.init()
            });
        }
    }

    static initIng = false

    async init() {
        if (!fs.existsSync('./plugins/riz-plugin/resources/original_ill/.git')) {
            logger.error(`[riz-plugin] 未下载曲绘文件，建议使用 /riz downill 命令进行下载`)
        }

        if (this.initIng) return
        this.initIng = true

        logger.info(`[riz-plugin]初始化曲目信息`)

        this.Level = Level
        this.tips = []
        this.ori_info = {}
        this.songsid = {}
        this.idssong = {}
        this.info_by_difficulty = {}
        this.idList = []

        /**最高定数 */
        this.MAX_DIFFICULTY = 0

        /**
         * 所有曲目曲名列表
         * @type {songString[]}
         */
        this.songlist = []

        /**
         * 信息文件
         * @type {OriInfoObject[]}
         */
        let info = await readFile.FileReader(path.join(infoPath, 'infolist.json'))

        // console.info(CsvInfo, Csvdif, Jsoninfo)
        for (let i = 0; i < info.length; i++) {

            const songInfo = info[i]
            const id = songInfo.id

            this.songsid[id] = songInfo.name
            this.idssong[songInfo.name] = id

            this.ori_info[id] = songInfo

            for (let level of this.Level) {

                if (songInfo.chart[level]) {

                    /**最高定数 */
                    this.MAX_DIFFICULTY = Math.round(Math.max(this.MAX_DIFFICULTY, Number(songInfo.chart[level].diff)) * 10) / 10
                }
            }
            this.idList.push(id)
        }


        if (this.MAX_DIFFICULTY != MAX_DIFFICULTY) {
            console.error('[riz-plugin] MAX_DIFFICULTY 常量未更新，请回报作者！', MAX_DIFFICULTY, this.MAX_DIFFICULTY)
        }

        /**
         * 曲目别名列表
         * @type {Record<idString, string[]>}
         */
        let nicklistTemp = await readFile.FileReader(path.join(infoPath, 'nicklist.yaml'))
        /** 
         * 默认别名，以id为key
         * @type {Record<idString, string[]>} 
         **/
        this.nicklist = {}
        /**
         * 以别名为key
         * @type {Record<string, idString[]>}
         */
        this.songnick = {}


        for (let id of fCompute.objectKeys(nicklistTemp)) {
            this.nicklist[id] = nicklistTemp[id]

            for (let item of nicklistTemp[id]) {
                if (!this.songnick[item]) {
                    this.songnick[item] = [id]
                } else {
                    this.songnick[item].push(id)
                }
            }
        }

        for (let songId of this.idList) {
            for (let level of this.Level) {
                let info = this.ori_info[songId]
                if (!info?.chart?.[level]?.diff) continue;
                const difStr = info.chart[level].diff.toFixed(1);
                if (this.info_by_difficulty[difStr]) {
                    this.info_by_difficulty[difStr].push({
                        ...info.chart[level],
                    })
                } else {
                    this.info_by_difficulty[difStr] = [{
                        ...info.chart[level],
                    }]
                }
            }
        }



        this.initIng = false
        logger.info(`[riz-plugin]初始化曲目信息完成`)
    }

    /**
     * 
     * @param {idString} id 原曲曲名
     * @returns {OriInfoObject | undefined} 曲目信息对象
     */
    info(id) {
        return this.ori_info[id]
    }

    /**
    * 根据参数模糊匹配返回原曲名称
    * @param {string} mic 别名
    * @param {number} [Distance=0.85] 阈值 猜词0.95
    * @returns {idString[]} 原曲id数组，按照匹配程度降序
    */
    fuzzysongsnick(mic, Distance = 0.85) {
        /**为空返回空 */
        if (!mic) return []
        /**
         * 按照匹配程度排序
         * @type {{id: idString, dis: number}[]}
         */
        let result = []

        const allinfo = this.ori_info

        for (let std in this.songnick) {
            let dis = fCompute.jaroWinklerDistance(mic, std)
            if (dis >= Distance) {
                for (let i in this.songnick[std]) {
                    result.push({ id: this.songnick[std][i], dis: dis })
                }
            }
        }

        const ids = fCompute.objectKeys(allinfo);
        for (let std of ids) {
            let dis = fCompute.jaroWinklerDistance(mic, std)
            if (dis >= Distance) {
                result.push({ id: allinfo[std].id, dis: dis })
            }
            if (!allinfo[std]?.id) continue
            dis = fCompute.jaroWinklerDistance(mic, allinfo[std].name)
            if (dis >= Distance) {
                result.push({ id: allinfo[std].id, dis: dis })
            }
        }


        result = result.sort((a, b) => b.dis - a.dis)

        /**
         * @type {idString[]}
         */
        let all = []
        for (let i of result) {

            if (all.includes(i.id)) continue //去重
            /**如果有完全匹配的曲目则放弃剩下的 */
            if (result[0].dis == 1 && i.dis < 1) break


            all.push(i.id)
        }

        return all
    }


    /**
     * 获取曲绘，返回地址，曲目id
     * @param {idString} id 曲目id，带.0
     * @return {string} 网址或文件地址
    */
    getill(id) {
        const songsinfo = this.ori_info[id]
        if (!songsinfo) {
            throw new Error(`曲目id ${id} 不存在`)
        }
        let ans = path.join(originalIllPath, "illustration", `illustration.${id}.png`)
        if (!fs.existsSync(ans)) {
            ans = `${Config.getUserCfg('config', 'onLinerizIllUrl')}/illustration/illustration.${id}.png`;
        }
        return ans
    }

    /**
     * 根据曲目id获取原名
     * @param {idString} id 曲目id
     * @returns {songString | undefined} 原名
     */
    idgetsong(id) {
        return this.songsid?.[id]
    }

    /**
     * 通过原曲曲目获取曲目id
     * @param {songString} song 原曲曲名
     * @returns {idString | undefined} 曲目id
     */
    SongGetId(song) {
        return this.idssong?.[song]
    }
}()

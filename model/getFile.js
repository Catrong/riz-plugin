import fs from 'node:fs'
import YAML from 'yaml'
import { dataPath, pluginDataPath, savePath } from "./path.js";
import path from 'node:path';
import logger from '../components/Logger.js';



export default class readFile {

    /**
     * 读取文件
     * @param {string} filePath 完整路径
     * @param {'JSON'|'YAML'|'TXT'} [style=undefined] 强制设置文件格式
     * @returns {Promise<any>|any}
     */
    static FileReader(filePath, style = undefined) {
        try {
            if (!fs.existsSync(filePath)) { return false }
            // console.info(filePath)
            if (!style) {
                style = /** @type {any} */(path.extname(filePath).toUpperCase().replace('.', ''))
            }
            switch (style) {
                case 'JSON': {
                    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
                }
                case 'YAML': {
                    return YAML.parse(fs.readFileSync(filePath, 'utf8'))
                }
                case 'TXT': {
                    return fs.readFileSync(filePath, 'utf8')
                }
                default: {
                    logger.error(`[riz-plugin][Read]不支持的文件格式`, style, filePath)
                    return fs.readFileSync(filePath, 'utf8')
                }
            }
        } catch (error) {
            logger.warn(`[riz-plugin][${filePath}] 读取失败`)
            logger.warn(error)
            return false
        }
    }

    /**
     * 存储文件
     * @param {string} filepath 文件名，含后缀
     * @param {any} data 目标数据
     * @param {'JSON'|'YAML'|'TXT'} [style=undefined] 强制指定保存格式
     */
    static SetFile(filepath, data, style = undefined) {
        try {
            const fatherPath = path.dirname(filepath)
            const fileName = path.basename(filepath)
            // console.info(filepath, fatherPath, fileName)
            if (!fs.existsSync(fatherPath)) {
                // 递归创建目录
                fs.mkdirSync(fatherPath, { recursive: true });
            }
            if (!style) {
                style = /** @type {any} */(path.extname(filepath).toUpperCase().replace('.', ''))
            }
            switch (style) {
                case 'JSON': {
                    fs.writeFileSync(filepath, JSON.stringify(data), 'utf8')
                    break
                }
                case 'YAML': {
                    fs.writeFileSync(filepath, YAML.stringify(data), 'utf8')
                    break
                }
                case 'TXT': {
                    fs.writeFileSync(filepath, data, 'utf8')
                }
                default: {
                    // logger.error(`[riz-plugin][Set]不支持的文件格式`, style, filepath)
                    fs.writeFileSync(filepath, data, 'utf8')
                    break
                }
            }
            return true
        } catch (error) {
            console.info(error)
            logger.warn(`[riz-plugin]写入文件 ${filepath} 时遇到错误`)
            logger.warn(error)
            return false
        }
    }

    /**
     * 删除指定文件
     * @param {string} path 
     */
    static async DelFile(path) {
        try {
            if (!fs.existsSync(`${path}`)) { return false }
            fs.unlink(`${path}`, (err) => {
                if (err) throw err
            })
            return true
        } catch (error) {
            logger.warn(`[riz-plugin][${path}] 删除失败`)
            logger.warn(error)
            return false
        }
    }

}
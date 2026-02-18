
import fs from 'fs'
import cfg from '../../../lib/config/config.js'
import { pluginRoot } from '../model/path.js'
import logger from './Logger.js'
const README_path = `${pluginRoot}/README.md`
const yunzai_ver = `v${cfg.package.version}`

let currentVersion = ''
let rizlineVer = ''
let rizlineVerNum = 0

try {
    if (fs.existsSync(README_path)) {
        const logs = fs.readFileSync(README_path, 'utf8')
        currentVersion = 'v' + (/插件版本\-([0-9\.]+)/.exec(logs)?.[1] ?? '')
        rizlineVer = /Rizline\-([0-9\.]+)/.exec(logs)?.[1] ?? ''
        rizlineVerNum = Number(/RizlineVer\-([0-9]+)/.exec(logs)?.[1] ?? 0)
    }
} catch (e) {
    logger.error(e)
    // do nth
}

let Version = {
    ver: currentVersion,
    yunzai: yunzai_ver,
    rizline: rizlineVer,
    rizlineVerNum: rizlineVerNum
};
export default Version

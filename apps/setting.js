import Config from '../components/Config.js'
import picmodle from '../model/picmodle.js'
import getInfo from '../model/getInfo.js'
import rizPluginBase from '../components/baseClass.js'

/**@import {botEvent} from '../components/baseClass.js' */

/**直接从guoba.support.js导入设置 */
let configInfo = (await import('../guoba.support.js')).supportGuoba().configInfo


export class rizhelp extends rizPluginBase {
    constructor() {
        super({
            name: 'riz-setting',
            dsc: 'rizgros屁股肉设置',
            event: 'message',
            priority: 1001,
            rule: [
                {
                    reg: `^[#/](pgr|PGR|屁股肉|riz|riz|(${Config.getUserCfg('config', 'cmdhead')}))(\\s*)(设置|set).*$`,
                    fnc: 'set'
                }
            ]
        })

    }

    /**
     * 
     * @param {botEvent} e 
     * @returns 
     */
    async set(e) {
        if (!e.isMaster) {
            return false;
        }
        let schemas = configInfo.schemas

        /**修改设置部分 */
        let msg = e.msg.replace(new RegExp(`^[#/](pgr|PGR|屁股肉|riz|riz|(${Config.getUserCfg('config', 'cmdhead')}))(\\s*)(设置|set)`), '')
        for (let i in schemas) {
            let schema = schemas[i]
            if (!schema.field) continue

            const field = /**@type {configName} */(schema.field)
            if (msg.match(schema.label)) {
                let value = msg.replace(schema.label, '')
                switch (schema.component) {
                    case 'Select':
                        let options = schema.componentProps?.options
                        if (!options) break;
                        for (let j = 0; j < options.length; j++) {
                            if (options[j].label == value) {
                                Config.modify('config', field, options[j].value)
                                break;
                            }
                        }
                        break;
                    case 'Input':
                        Config.modify('config', field, value)
                        break;
                    case 'InputNumber':
                        Config.modify('config', field, Math.max(Math.min(Number(value), schema.componentProps?.max || Infinity), schema.componentProps?.min || -Infinity))
                        break;
                    case 'Switch':
                        switch (value) {
                            case 'true':
                            case 'ON':
                            case 'on':
                            case '开启':
                            case '开':
                                Config.modify('config', field, true)
                                break;
                            case 'false':
                            case 'OFF':
                            case 'off':
                            case '关闭':
                            case '关':
                                Config.modify('config', field, false)
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'RadioGroup': {
                        let options = schema.componentProps?.options
                        if (!options) break;
                        for (let j = 0; j < options.length; j++) {
                            if (options[j].label == value) {
                                Config.modify('config', field, options[j].value)
                                break;
                            }
                        }
                        break;
                    }
                    default:
                        break;
                }
            }
        }


        /**渲染图片部分 */
        let config = configInfo.getConfigData()
        let data = []
        for (let i in schemas) {
            let schema = schemas[i]
            switch (schema.component) {
                case 'Divider':
                    data.push({
                        label: schema.label,
                        type: 'divider'
                    })
                    break;
                case 'Select':
                    if (!schema.field) break;
                    // @ts-ignore
                    let value = config[schema.field]
                    let options = schema.componentProps?.options
                    if (!options) break;
                    for (let j = 0; j < options.length; j++) {
                        if (options[j].value == value) {
                            value = options[j].label
                            break;
                        }
                    }
                    data.push({
                        label: schema.label,
                        bottomHelpMessage: schema.bottomHelpMessage,
                        type: 'space',
                        value,
                    })
                    break;
                case 'Input':
                case 'InputNumber':
                    if (!schema.field) break;
                    data.push({
                        label: schema.label,
                        bottomHelpMessage: schema.bottomHelpMessage,
                        type: 'space',
                        // @ts-ignore
                        value: config[schema.field],
                        // @ts-ignore
                        drc: schema.componentProps.addonAfter || ''
                    })
                    break;
                case 'Switch':
                    data.push({
                        label: schema.label,
                        bottomHelpMessage: schema.bottomHelpMessage,
                        type: 'switch',
                        // @ts-ignore
                        value: config[schema.field],
                    })
                    break;
                case 'RadioGroup':
                    if (!schema.field) break;
                    data.push({
                        label: schema.label,
                        bottomHelpMessage: schema.bottomHelpMessage,
                        type: 'space',
                        // @ts-ignore
                        value: schema.componentProps?.options.find(o => o.value == config[schema.field])?.label || '未知',
                    })
                    break;
                default:
                    break;
            }
        }
        e.reply(await picmodle.common(e, 'setting', {
            data,
            background: getInfo.getill(getInfo.idList[Number((Math.random() * (getInfo.idList.length - 1)).toFixed(0))]),
        }))
    }
}

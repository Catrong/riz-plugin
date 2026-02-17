import Config from './components/Config.js'

// 支持锅巴
export function supportGuoba() {
    return {
        // 插件信息，将会显示在前端页面
        // 如果你的插件没有在插件库里，那么需要填上补充信息
        // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
        pluginInfo: {
            name: 'riz-plugin',
            title: 'Riz-Plugin',
            author: '@Catrong',
            authorLink: 'https://github.com/Catrong',
            link: 'https://gitee.com/Catrong/riz-plugin',
            isV3: true,
            isV2: false,
            description: 'Rizline 查分及娱乐插件',
            // 显示图标，此为个性化配置
            // 图标可在 https://icon-sets.iconify.design 这里进行搜索
            icon: 'icon-park-solid:pigeon',
            // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
            iconColor: '#000'
        },
        // 配置项信息
        configInfo: {
            // 配置项 schemas
            schemas: [
                {
                    label: '渲染设置',
                    component: 'SOFT_GROUP_BEGIN'
                },
                {
                    field: 'renderScale',
                    label: '渲染精度',
                    bottomHelpMessage: '对所有的图片生效，设置渲染精度',
                    component: 'InputNumber',
                    required: true,
                    componentProps: {
                        min: 50,
                        max: 200,
                        placeholder: '请输入渲染精度',
                        addonAfter: "%"
                    },
                },
                {
                    field: 'randerQuality',
                    label: '渲染质量',
                    bottomHelpMessage: '对所有的图片生效，设置渲染的质量',
                    component: 'InputNumber',
                    required: true,
                    componentProps: {
                        min: 1,
                        max: 100,
                        placeholder: '请输入渲染质量',
                        addonAfter: "%"
                    },
                },
                {
                    field: 'timeout',
                    label: '渲染超时时间',
                    bottomHelpMessage: '对所有的图片生效，超时后重启puppeteer，单位ms',
                    component: 'InputNumber',
                    required: true,
                    componentProps: {
                        min: 1000,
                        max: 120000,
                        placeholder: '请输入渲染超时时间',
                        addonAfter: "ms"
                    },
                },
                {
                    field: 'waitingTimeout',
                    label: '等待超时时间',
                    bottomHelpMessage: '对所有的图片生效，单位ms',
                    component: 'InputNumber',
                    required: true,
                    componentProps: {
                        min: 1000,
                        max: 120000,
                        placeholder: '请输入等待超时时间',
                        addonAfter: "ms"
                    },
                },
                {
                    field: 'renderNum',
                    label: '并行渲染数量',
                    bottomHelpMessage: '并行数量越多，占用的资源越多，建议谨慎修改，修改后重启生效',
                    component: 'InputNumber',
                    required: true,
                    componentProps: {
                        min: 1,
                        max: 10,
                        placeholder: '请输入并行渲染数量',
                    },
                },
                {
                    label: '',
                    component: 'Divider'
                },
                {
                    field: 'onLinePhiIllUrl',
                    label: '在线曲绘来源',
                    bottomHelpMessage: '仅在未下载曲绘时有效，不影响下载曲绘指令。在线曲绘将重复下载曲绘资源，建议使用 /下载曲绘 将曲绘缓存到本地',
                    component: "RadioGroup",
                    componentProps: {
                        buttonStyle: "solid",
                        optionType: "button",
                        options: [
                            {
                                label: 'github',
                                value: "https://github.com/Catrong/riz-plugin-ill/blob/main"
                            },
                            {
                                label: 'github代理(gh-proxy)',
                                value: "https://gh-proxy.org/https://raw.githubusercontent.com/Catrong/riz-plugin-ill/refs/heads/main"
                            },
                            {
                                label: 'github代理(gitproxy.click)',
                                value: "https://gitproxy.click/https://raw.githubusercontent.com/Catrong/riz-plugin-ill/refs/heads/main"
                            }
                        ]
                    }
                },
                {
                    field: 'downIllUrl',
                    label: '下载曲绘源',
                    bottomHelpMessage: '下载曲绘的源，实时生效',
                    component: "RadioGroup",
                    componentProps: {
                        buttonStyle: "solid",
                        optionType: "button",
                        options: [
                            {
                                label: 'github',
                                value: "https://github.com/Catrong/riz-plugin-ill.git"
                            },
                            {
                                label: 'github代理(gh-proxy)',
                                value: "https://gh-proxy.com/https://github.com/Catrong/riz-plugin-ill.git"
                            },
                            {
                                label: 'github代理(gitproxy.click)',
                                value: "https://gitproxy.click/https://github.com/Catrong/riz-plugin-ill.git"
                            }
                        ]
                    }
                },
                {
                    field: 'watchInfoPath',
                    label: '监听信息文件',
                    bottomHelpMessage: '是否监听信息文件变化，如果机器人有自动更新插件功能建议开启，如遇监听文件数量超限请尝试关闭',
                    component: 'Switch',
                },
                {
                    field: 'cmdhead',
                    label: '命令头',
                    bottomHelpMessage: '命令正则匹配开头，不包含#/，支持正则表达式，\'\\\' 请双写( \\s --> \\\\s )，最外层可以不加括号',
                    component: 'Input',
                    required: false,
                    componentProps: {
                        placeholder: '请输入命令头',
                    },
                },
                {
                    field: 'mutiNickWaitTimeOut',
                    label: '多个曲目回复序号等待时长',
                    bottomHelpMessage: '别名重复触发多个曲目选择时，等待回复序号的时长，单位：秒',
                    component: 'InputNumber',
                    required: true,
                    componentProps: {
                        min: 5,
                        max: 999,
                        placeholder: '请输入等待时长',
                    },
                },
            ],
            // 获取配置数据方法（用于前端填充显示数据）
            getConfigData() {
                const defset = Config.getdefSet('config')
                /**@type {Record<configName, any> | {}} */
                let config = {}
                for (var i in defset) {
                    config[i] = Config.getUserCfg('config', i)
                }
                return config
            },
            // 设置配置的方法（前端点确定后调用的方法）
            setConfigData(data, { Result }) {
                if (data.isGuild) {
                    data.WordB19Img = false
                    data.WordSuggImg = false
                }
                var vis = false
                // if (data.VikaToken && data.VikaToken.length != 23) {
                //     data.VikaToken = ''
                //     vis = true
                // }
                for (let [keyPath, value] of Object.entries(data)) {
                    Config.modify('config', keyPath, value)
                }
                // if (vis) {
                //     return Result.ok({}, 'VikaToken非法')
                // } else {
                return Result.ok({}, '保存成功~')
                // }
            },
        },
    }
}

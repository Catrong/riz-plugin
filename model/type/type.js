/**
 * @typedef {string & { readonly brand: unique symbol }} idString 曲目id
 * @typedef {string & { readonly brand: unique symbol }} songString 曲目名称
 * @typedef {'EZ' | 'HD' | 'IN' | 'AT'} levelKind 有效难度分级
 * @typedef {'tap' | 'drag' | 'hold' } noteKind note分类
 */

/**
 * @typedef { 'song'
 * } allFnc 全部指令
 */

/**
 * 渲染设置
 * @typedef {'downIllUrl'} downIllUrl 下载曲绘来源
 * @typedef {'renderScale'} renderScale 渲染精度
 * @typedef {'randerQuality'} randerQuality 渲染质量
 * @typedef {'timeout'} timeout 渲染超时时间
 * @typedef {'waitingTimeout'} waitingTimeout 等待超时时间
 * @typedef {'renderNum'} renderNum 并行渲染数量
 * 系统设置
 * @typedef {'watchInfoPath'} watchInfoPath 监听信息文件
 * @typedef {'autoPullRizIll'} autoPullRizIll 自动更新曲绘
 * @typedef {'cmdhead'} cmdhead 命令头
 * @typedef {'mutiNickWaitTimeOut'} mutiNickWaitTimeOut 多个曲目回复序号等待时长
 * 
 * @typedef {downIllUrl |
 * renderScale |
 * randerQuality |
 * timeout |
 * waitingTimeout |
 * renderNum |
 * watchInfoPath |
 * autoPullRizIll |
 * cmdhead |
 * mutiNickWaitTimeOut
 * } configName 全部设置
 */
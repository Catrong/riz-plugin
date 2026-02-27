/**
 * @typedef {string & { readonly brand: unique symbol }} idString 曲目id
 * @typedef {string & { readonly brand: unique symbol }} songString 曲目名称
 * @typedef {'EZ' | 'HD' | 'IN' | 'AT'} levelKind 有效难度分级
 * @typedef {'tap' | 'drag' | 'hold' } noteKind note分类
 */

/**
 * @typedef { 'song' |
 * 'bind' |
 * 'unbind' |
 * 'bindinfo' |
 * 'updateRecord' |
 * 'b40' |
 * 'table'
 * } allFnc 全部指令
 */

/**
 * 渲染设置
 * @typedef {'onLinerizIllUrl'} onLinerizIllUrl 在线曲绘来源
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
 * @typedef {'ApiTimeout'} ApiTimeout 平台 API 请求超时
 * 
 * @typedef { 'onLinerizIllUrl' |
 * downIllUrl |
 * renderScale |
 * randerQuality |
 * timeout |
 * waitingTimeout |
 * renderNum |
 * watchInfoPath |
 * autoPullRizIll |
 * cmdhead |
 * mutiNickWaitTimeOut |
 * ApiTimeout
 * } configName 全部设置
 */

/** @typedef {string} IsoDateString */

/** @typedef {'coin' | 'dot' | string} CurrencyType */

/**
 * 曲目资源 ID。
 * 约定格式通常为：`track.xxx`（这里只做 string 约束，避免引入 TS 语法）。
 * @typedef {string} TrackAssetId
 */

/**
 * 布局资源 ID。
 * 约定格式通常为：`layout.xxx`
 * @typedef {string} LayoutId
 */

/**
 * 曲绘资源 ID。
 * 约定格式通常为：`illustration.xxx`
 * @typedef {string} IllustrationId
 */

/**
 * 简介资源 ID。
 * 约定格式通常为：`bio.xxx`
 * @typedef {string} BioId
 */

/**
 * 活动资源 ID。
 * 约定格式通常为：`event.xxx`
 * @typedef {string} EventId
 */

/**
 * 道具/资源 ID（可能是 layout/illustration/bio/event 等）。
 * @typedef {LayoutId | IllustrationId | BioId | EventId | string} ItemAssetId
 */

/**
 * @typedef {Object} Vec3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} RizcardProfile
 * @property {Vec3} avatarPos
 * @property {IllustrationId | ''} avatarId
 * @property {string} bioId1
 * @property {string} bioId2
 * @property {IllustrationId | ''} backgroundId
 * @property {LayoutId | ''} layoutId
 * @property {IsoDateString} createTime
 */

/**
 * @typedef {Object} ProductCost
 * @property {CurrencyType} type
 * @property {number} amount
 */

/**
 * @typedef {Object} ProductGood
 * @property {number} id
 * @property {string} content
 * @property {ProductCost[]} costs
 * @property {number} onSalePercent
 * @property {number} getLimit
 * @property {string} preTask
 */

/**
 * @typedef {Object} ProductEvent
 * @property {number} eventId
 * @property {ProductGood[]} goods
 */

/**
 * @typedef {Object} OwnedProduct
 * @property {number} goodId
 * @property {number} purchaseCount
 */

/**
 * @typedef {Object} InventoryItem
 * @property {number} amount
 * @property {ItemAssetId} itemAssetId
 */

/**
 * @typedef {Object} OwnedAchievement
 * @property {string} achievementId
 * @property {IsoDateString} getTime
 */

/** @typedef {'EZ' | 'HD' | 'IN' | string} DifficultyClassName */

/**
 * @typedef {Object} BestRecord
 * @property {TrackAssetId} trackAssetId
 * @property {DifficultyClassName} difficultyClassName
 * @property {number} score
 * @property {number} completeRate
 * @property {boolean} isFullCombo
 * @property {boolean} isClear
 */

/**
 * @typedef {Object} OwnRizcards
 * @property {unknown[]} rizcards
 * @property {unknown[]} staticRizcards
 * @property {number} readed
 */

/**
 * @typedef {Object} MailAttachment
 * @property {string} _id
 * @property {string} itemId
 * @property {number} num
 */

/**
 * @typedef {Object} Mail
 * @property {string} _id
 * @property {string} mailId
 * @property {string} title
 * @property {string} content
 * @property {IsoDateString} receivedTime
 * @property {IsoDateString} expiredTime
 * @property {boolean} read
 * @property {boolean} deleted
 * @property {MailAttachment[]} attachments
 */

/**
 * @typedef {Object} UnlockInfo
 * @property {number} current
 * @property {number} progress
 */

/**
 * @typedef {Object} ChallengeDefinition
 * @property {number} id
 * @property {string} chartId
 * @property {string} name
 * @property {string} describe
 * @property {string} conditionDesc
 * @property {number} type
 * @property {number} series
 * @property {number} passRate
 * @property {string} passCondition
 * @property {string} drop
 * @property {number} passRelatedId
 */

/**
 * @typedef {Object} LevelRks
 * @property {TrackAssetId} trackId
 * @property {DifficultyClassName} difficultyClassName
 * @property {number} rks
 */

/**
 * @typedef {Object} GameData
 * @property {string} _id
 * @property {string} userId
 * @property {string} username
 * @property {number} coin
 * @property {number} dot
 * @property {RizcardProfile} rizcard
 * @property {ProductEvent[]} getProducts
 * @property {OwnedProduct[]} getOwnProducts
 * @property {InventoryItem[]} getItems
 * @property {OwnedAchievement[]} getOwnAchievements
 * @property {BestRecord[]} myBest
 * @property {TrackAssetId[]} unlockedLevels
 * @property {TrackAssetId[]} appearLevels
 * @property {OwnRizcards} ownRizcards
 * @property {unknown[]} staticRizcards
 * @property {Mail[]} mails
 * @property {number} mailSyncId
 * @property {unknown[]} features
 * @property {UnlockInfo} unlockInfo
 * @property {ChallengeDefinition[]} challenge
 * @property {unknown[]} challengeProgress
 * @property {number} userBatch
 * @property {number} totalRks
 * @property {LevelRks[]} levelsRks
 */


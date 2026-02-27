import fs from 'node:fs'
import path from 'node:path'
import { Plugin_Path, logger } from '../components/index.js'
import { redisPath } from './constNum.js'

const RECORD_FILE = path.join(Plugin_Path, 'data', 'platform_record.json')

/**
 * @param {string} userId
 */
function getRedisKey(userId) {
  return `${redisPath}:rizlineRecord:${userId}`
}

function nowIso() {
  return new Date().toISOString()
}

/**
 * @param {string} txt
 */
function safeJsonParse(txt) {
  try {
    return JSON.parse(txt)
  } catch {
    return null
  }
}

function ensureDir() {
  fs.mkdirSync(path.dirname(RECORD_FILE), { recursive: true })
}

function readAllFromFile() {
  ensureDir()
  if (!fs.existsSync(RECORD_FILE)) return {}
  const txt = fs.readFileSync(RECORD_FILE, 'utf8')
  const json = safeJsonParse(txt)
  return json && typeof json === 'object' ? json : {}
}

/**
 * @param {any} all
 */
function writeAllToFile(all) {
  ensureDir()
  fs.writeFileSync(RECORD_FILE, JSON.stringify(all, null, 2), 'utf8')
}

function hasRedis() {
  // eslint-disable-next-line no-undef
  // @ts-ignore
  return typeof redis !== 'undefined' && redis && typeof redis.get === 'function'
}

/**
 * @typedef {object} RizlineRecordCache
 * @property {GameData | string} record 解密后的存档（可能是 JSON 字符串，也可能是已解析对象）
 * @property {string=} rizlineUserId
 * @property {string=} sign
 * @property {boolean=} refreshed
 * @property {string} updatedAt
 */

/**
 * @param {string|number} userId
 * @returns {Promise<RizlineRecordCache|null>}
 */
export async function getRecordCache(userId) {
  const uid = String(userId)
  if (hasRedis()) {
    try {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      const txt = await redis.get(getRedisKey(uid))
      if (!txt) return null
      const obj = safeJsonParse(txt)
      return obj && obj.record ? obj : null
    } catch (/**@type {any} */ e) {
      logger.error(`[riz-plugin] platformRecordStore.get(redis): ${e?.message || e}`)
    }
  }

  const all = readAllFromFile()
  const rec = all[uid]
  return rec && rec.record ? rec : null
}

/**
 * @param {string|number} userId
 * @param {Omit<RizlineRecordCache,'updatedAt'> & {updatedAt?: string}} cache
 */
export async function setRecordCache(userId, cache) {
  const uid = String(userId)
  const rec = {
    ...cache,
    updatedAt: cache?.updatedAt || nowIso()
  }
  if (hasRedis()) {
    try {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      await redis.set(getRedisKey(uid), JSON.stringify(rec))
      return
    } catch (/**@type {any} */ e) {
      logger.error(`[riz-plugin] platformRecordStore.set(redis): ${e?.message || e}`)
    }
  }

  const all = readAllFromFile()
  all[uid] = rec
  writeAllToFile(all)
}

/**
 * @param {string|number} userId
 */
export async function clearRecordCache(userId) {
  const uid = String(userId)
  if (hasRedis()) {
    try {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      await redis.del(getRedisKey(uid))
    } catch (/**@type {any} */ e) {
      logger.error(`[riz-plugin] platformRecordStore.clear(redis): ${e?.message || e}`)
    }
  }
  const all = readAllFromFile()
  if (all[uid]) {
    delete all[uid]
    writeAllToFile(all)
  }
}

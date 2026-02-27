import fs from 'node:fs'
import path from 'node:path'
import { Plugin_Path, logger } from '../components/index.js'
import { redisPath } from './constNum.js'

const BIND_FILE = path.join(Plugin_Path, 'data', 'platform_bind.json')

/**
 * 
 * @param {string} userId 
 * @returns 
 */
function getRedisKey(userId) {
  return `${redisPath}:platformBind:${userId}`
}

function nowIso() {
  return new Date().toISOString()
}

/**
 * 
 * @param {string} txt 
 * @returns 
 */
function safeJsonParse(txt) {
  try {
    return JSON.parse(txt)
  } catch {
    return null
  }
}

function ensureBindFileDir() {
  fs.mkdirSync(path.dirname(BIND_FILE), { recursive: true })
}

function readAllFromFile() {
  ensureBindFileDir()
  if (!fs.existsSync(BIND_FILE)) return {}
  const txt = fs.readFileSync(BIND_FILE, 'utf8')
  const json = safeJsonParse(txt)
  return json && typeof json === 'object' ? json : {}
}

/**
 * @param {any} all
 */
function writeAllToFile(all) {
  ensureBindFileDir()
  fs.writeFileSync(BIND_FILE, JSON.stringify(all, null, 2), 'utf8')
}

function hasRedis() {
  // eslint-disable-next-line no-undef
  // @ts-ignore
  return typeof redis !== 'undefined' && redis && typeof redis.get === 'function'
}

/**
 * @typedef {object} PlatformBindRecord
 * @property {string} sessionToken
 * @property {string} tokenLast4
 * @property {string=} note
 * @property {string=} sessionId
 * @property {string=} apiBaseUrl
 * @property {string} boundAt
 */

/**
 * @param {string|number} userId
 * @returns {Promise<PlatformBindRecord|null>}
 */
export async function getPlatformBind(userId) {
  const uid = String(userId)
  if (hasRedis()) {
    try {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      const txt = await redis.get(getRedisKey(uid))
      if (!txt) return null
      const obj = safeJsonParse(txt)
      return obj && obj.sessionToken ? obj : null
    } catch (/**@type {any} */ e) {
      logger.error(`[riz-plugin] platformBindStore.get(redis): ${e?.message || e}`)
    }
  }

  const all = readAllFromFile()
  const rec = all[uid]
  return rec && rec.sessionToken ? rec : null
}

/**
 * @param {string|number} userId
 * @param {PlatformBindRecord} record
 */
export async function setPlatformBind(userId, record) {
  const uid = String(userId)
  const rec = {
    ...record,
    boundAt: record?.boundAt || nowIso()
  }

  if (hasRedis()) {
    try {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      await redis.set(getRedisKey(uid), JSON.stringify(rec))
      return
    } catch (/**@type {any} */ e) {
      logger.error(`[riz-plugin] platformBindStore.set(redis): ${e?.message || e}`)
    }
  }

  const all = readAllFromFile()
  all[uid] = rec
  writeAllToFile(all)
}

/**
 * @param {string|number} userId
 */
export async function clearPlatformBind(userId) {
  const uid = String(userId)
  if (hasRedis()) {
    try {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      await redis.del(getRedisKey(uid))
    } catch (/**@type {any} */ e) {
      logger.error(`[riz-plugin] platformBindStore.clear(redis): ${e?.message || e}`)
    }
  }
  const all = readAllFromFile()
  if (all[uid]) {
    delete all[uid]
    writeAllToFile(all)
  }
}

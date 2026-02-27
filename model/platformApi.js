import axios from 'axios'
import { Config, logger } from '../components/index.js'
import { ApiBaseUrl } from './constNum.js'

/**
 * 
 * @param {string} baseUrl 
 * @returns 
 */
function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return ''
  return String(baseUrl).trim().replace(/\/+$/, '')
}

function getApiConfig() {
  const baseUrl = normalizeBaseUrl(ApiBaseUrl)
  const timeout = Number(Config.getUserCfg('config', 'ApiTimeout'))
  return {
    baseUrl,
    timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 15000
  }
}

/**
 * 通过一次性密钥兑换 sessionToken（给 BOT 绑定用）
 * @param {string} oneTimeKey
 * @param {string | undefined} platformNote
 */
export async function exchangeSessionToken(oneTimeKey, platformNote) {
  const { baseUrl, timeout } = getApiConfig()
  if (!baseUrl) {
    throw new Error('ApiBaseUrl 未配置')
  }

  try {
    const res = await axios.post(
      `${baseUrl}/auth/session-tokens/exchange`,
      {
        oneTimeKey,
        platformNote
      },
      {
        timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return res.data
  } catch (/**@type {any} */ err) {
    const message = err?.response?.data?.message || err?.message || String(err)
    logger.error(`[riz-plugin] platformApi.exchangeSessionToken: ${message}`)
    throw err
  }
}

/**
 * 使用 sessionToken 获取 Rizline 存档
 * 文档：GET /rizline/record
 * @param {string} sessionToken st_...
 */
export async function getRizlineRecord(sessionToken) {
  const { baseUrl, timeout } = getApiConfig()
  if (!baseUrl) {
    throw new Error('ApiBaseUrl 未配置')
  }
  if (!sessionToken || typeof sessionToken !== 'string') {
    throw new Error('sessionToken 不能为空')
  }

  try {
    const res = await axios.get(`${baseUrl}/rizline/record`, {
      timeout,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        'X-Session-Token': sessionToken
      }
    })
    return res.data
  } catch (/**@type {any} */ err) {
    const message = err?.response?.data?.message || err?.message || String(err)
    logger.error(`[riz-plugin] platformApi.getRizlineRecord: ${message}`)
    throw err
  }
}


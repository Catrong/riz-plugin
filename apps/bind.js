import { Config, logger } from '../components/index.js'
import rizPluginBase from '../components/baseClass.js'
import getBanGroup from '../model/getBanGroup.js'
import send from '../model/send.js'
import { createBindingChallenge, exchangeSessionToken, pollBindingChallenge } from '../model/platformApi.js'
import { clearPlatformBind, getPlatformBind, setPlatformBind } from '../model/platformBindStore.js'
import { ApiBaseUrl } from '../model/constNum.js'
import fCompute from '../model/fCompute.js'

/** @import { botEvent } from '../components/baseClass.js' */
/**
 * @param {string} token
 */
function maskLast4(token) {
  if (!token) return '????'
  const t = String(token)
  return t.length >= 4 ? t.slice(-4) : t
}

const activeChallengePollers = new Map()

/**
 * @param {string} userId
 */
function stopChallengePoll(userId) {
  const key = String(userId)
  const poller = activeChallengePollers.get(key)
  if (!poller) return
  poller.cancelled = true
  if (poller.timer) clearTimeout(poller.timer)
  activeChallengePollers.delete(key)
}

/**
 * @param {botEvent} e
 * @param {{ pollToken: any; challengeId: any; loginUrl: any; expiresAt: string; }} challenge
 * @param {string} note
 * @param {string} defaultNote
 */
function startChallengePoller(e, challenge, note, defaultNote) {
  const userId = String(e.user_id)
  stopChallengePoll(userId)

  const poller = {
    userId,
    pollToken: challenge.pollToken,
    challengeId: challenge.challengeId,
    loginUrl: challenge.loginUrl,
    expiresAt: challenge.expiresAt,
    cancelled: false,
    /** @type {NodeJS.Timeout | null} */
    timer: null,
    failureCount: 0
  }

  const expiresAtMs = Date.parse(challenge.expiresAt)

  const startMessage = `已生成临时授权链接，5 分钟内有效：\n${challenge.loginUrl}\n\n请先打开链接，阅读并同意协议后完成登录。登录完成后 BOT 会自动继续绑定。`

  activeChallengePollers.set(userId, poller)

  const scheduleNext = (/** @type {number | undefined} */ delay) => {
    if (poller.cancelled) return
    poller.timer = setTimeout(runOnce, delay)
  }

  const stopWithMessage = async (/** @type {string} */ text) => {
    stopChallengePoll(userId)
    await send.send_with_At(e, text)
  }

  const runOnce = async () => {
    if (poller.cancelled) return
    if (Date.now() >= expiresAtMs) {
      await stopWithMessage('临时授权链接已过期，请重新执行绑定命令。')
      return
    }

    try {
      const data = await pollBindingChallenge(poller.pollToken)
      if (poller.cancelled) return

      if (data?.oneTimeKey) {
        const exchange = await exchangeSessionToken(data.oneTimeKey, data.platformNote || note || defaultNote)
        const sessionToken = exchange?.sessionToken
        if (!sessionToken || typeof sessionToken !== 'string') {
          await stopWithMessage('绑定失败：平台返回数据异常（缺少 sessionToken）。')
          return
        }

        const tokenLast4 = exchange?.session?.tokenLast4 || maskLast4(sessionToken)
        const record = {
          sessionToken,
          tokenLast4,
          note: exchange?.session?.platformNote || exchange?.session?.userNote || data?.platformNote || note || undefined,
          sessionId: exchange?.session?.id,
          boundAt: new Date().toISOString()
        }
        await setPlatformBind(e.user_id, record)
        await stopWithMessage(
          `绑定成功！token 尾号：${record.tokenLast4}${record.note ? `，备注：${record.note}` : ''}\n可用：/${getCmdHead()} unbind 解绑，/${getCmdHead()} bindinfo 查看状态。`
        )
        return
      }

      if (data?.status === 'expired' || data?.status === 'cancelled') {
        await stopWithMessage('临时授权流程已过期或取消，请重新执行绑定命令。')
        return
      }

      poller.failureCount = 0
      scheduleNext(3000)
    } catch (/**@type {any} */ err) {
      poller.failureCount += 1
      const backoff = Math.min(15000, 3000 * (2 ** Math.max(0, poller.failureCount - 1)))
      logger.error(`[riz-plugin] bind challenge poll failed: ${err?.message || err}`)
      if (poller.failureCount >= 5) {
        await stopWithMessage('临时授权轮询失败次数过多，请稍后重新尝试绑定。')
        return
      }
      scheduleNext(backoff)
    }
  }

  void send.send_with_At(e, startMessage)
  scheduleNext(1000)
  return poller
}

const getCmdHead = fCompute.getCmdHead;

export class rizbind extends rizPluginBase {
  constructor() {
    super({
      name: 'riz-绑定平台',
      dsc: 'BOT 用户绑定 riz-plugin-api 平台（sessionToken）',
      event: 'message',
      priority: 1000,
      rule: [
        {
          reg: `^[#/](${getCmdHead()})(\\s*)(绑定平台|bindinfo).*$`,
          fnc: 'bindinfo'
        },
        {
          reg: `^[#/](${getCmdHead()})(\\s*)(解绑平台|unbind).*$`,
          fnc: 'unbind'
        },
        {
          reg: `^[#/](${getCmdHead()})(\\s*)(绑定|bind).*$`,
          fnc: 'bind'
        }
      ]
    })
  }

  /**
   * 绑定平台：/r bind <otk_xxx> [note]
   * 也支持：/r bind st_xxx [note]
   * @param {botEvent} e
   */
  async bind(e) {
    if (await getBanGroup.get(e, 'bind')) {
      await send.send_with_At(e, '这里被管理员禁止使用绑定功能了呐QAQ！')
      return true
    }

    const msg = e.msg
      .replace(new RegExp(`^[#/](${getCmdHead()})(\\s*)(绑定|bind)(\\s*)`), '')
      .trim()

    if (!msg) {
      try {
        const defaultNote = `yunzai:${e.user_id}`
        const challenge = await createBindingChallenge(e.user_id, 5 * 60, defaultNote)
        startChallengePoller(e, challenge, '', defaultNote)
      } catch (/**@type {any} */ err) {
        const apiMsg = err?.response?.data?.message
        const msg2 = apiMsg || err?.message || String(err)
        logger.error(`创建绑定挑战失败`, err)
        await send.send_with_At(e, `创建临时授权链接失败：${msg2}`)
      }
      return true
    }

    const first = msg.split(/\s+/)[0]
    const note = msg.slice(first.length).trim()

    // 已有绑定提示（允许覆盖）
    const existed = await getPlatformBind(e.user_id)
    if (existed?.sessionToken) {
      await send.send_with_At(e, `检测到你已绑定过平台（尾号 ${existed.tokenLast4}），将会覆盖为新的绑定。`)
    }

    const defaultNote = `yunzai:${e.user_id}`

    // 允许直接绑定 sessionToken（st_...）
    if (first.startsWith('st_')) {
      const record = {
        sessionToken: first,
        tokenLast4: maskLast4(first),
        note: note || defaultNote || undefined,
        boundAt: new Date().toISOString()
      }
      await setPlatformBind(e.user_id, record)
      await send.send_with_At(
        e,
        `绑定成功！token 尾号：${record.tokenLast4}${record.note ? `，备注：${record.note}` : ''}\n可用：/${getCmdHead()} unbind 解绑，/${getCmdHead()} bindinfo 查看状态。`
      )
      return true
    }

    if (!first.startsWith('otk_')) {
      await send.send_with_At(
        e,
        `看起来不是有效的一次性密钥/会话令牌哦（需要以 otk_ 或 st_ 开头）。\n格式：/${getCmdHead()} bind otk_xxx [备注]`
      )
      return true
    }

    let data
    try {
      data = await exchangeSessionToken(first, note || defaultNote)
    } catch (/**@type {any} */ err) {
      const apiMsg = err?.response?.data?.message
      const msg2 = apiMsg || err?.message || String(err)
      logger.error(`绑定平台失败`, err)
      await send.send_with_At(
        e,
        `绑定失败：${msg2}\n请确认：\n1) 一次性密钥未过期且只使用一次\n2) 输入的密钥正确无误`
      )
      return true
    }

    const sessionToken = data?.sessionToken
    if (!sessionToken || typeof sessionToken !== 'string') {
      await send.send_with_At(e, '绑定失败：平台返回数据异常（缺少 sessionToken）。')
      return true
    }

    const tokenLast4 = data?.session?.tokenLast4 || maskLast4(sessionToken)
    const record = {
      sessionToken,
      tokenLast4,
      // 新版 API: session.platformNote / session.userNote
      note: data?.session?.platformNote || data?.session?.userNote || note || undefined,
      sessionId: data?.session?.id,
      boundAt: new Date().toISOString()
    }
    await setPlatformBind(e.user_id, record)

    await send.send_with_At(
      e,
      `绑定成功！token 尾号：${record.tokenLast4}${record.note ? `，备注：${record.note}` : ''}\n可用：/${getCmdHead()} unbind 解绑，/${getCmdHead()} bindinfo 查看状态。`
    )
    return true
  }

  /**
   * 解绑平台
   * @param {botEvent} e
   */
  async unbind(e) {
    if (await getBanGroup.get(e, 'unbind')) {
      await send.send_with_At(e, '这里被管理员禁止使用解绑功能了呐QAQ！')
      return true
    }
    const existed = await getPlatformBind(e.user_id)
    if (!existed) {
      stopChallengePoll(e.user_id)
      await send.send_with_At(e, '你当前没有绑定平台，无需解绑。')
      return true
    }

    stopChallengePoll(e.user_id)
    await clearPlatformBind(e.user_id)
    await send.send_with_At(e, `解绑成功！已移除尾号 ${existed.tokenLast4} 的绑定信息。`)
    return true
  }

  /**
   * 查询绑定状态
   * @param {botEvent} e
   */
  async bindinfo(e) {
    const existed = await getPlatformBind(e.user_id)
    if (!existed) {
      const active = activeChallengePollers.get(String(e.user_id))
      if (active) {
        await send.send_with_At(
          e,
          `你当前有一个临时授权流程正在进行中。\n链接：${active.loginUrl}\n有效期至：${active.expiresAt}\nBOT 正在轮询绑定状态，登录后会自动完成。`
        )
        return true
      }

      await send.send_with_At(
        e,
        `你还没有绑定平台哦。\n用法：/${getCmdHead()} bind [otk_xxx] [备注]\n不带参数时会自动生成临时授权链接。`
      )
      return true
    }
    const base = existed.apiBaseUrl || ApiBaseUrl
    await send.send_with_At(
      e,
      `已绑定平台：token 尾号 ${existed.tokenLast4}${existed.note ? `，备注：${existed.note}` : ''}${base ? `\n平台地址：${base}` : ''}${existed.boundAt ? `\n绑定时间：${existed.boundAt}` : ''}`
    )
    return true
  }
}

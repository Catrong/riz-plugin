import { Config, logger } from '../components/index.js'
import rizPluginBase from '../components/baseClass.js'
import getBanGroup from '../model/getBanGroup.js'
import send from '../model/send.js'
import { exchangeSessionToken } from '../model/platformApi.js'
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
      await send.send_with_At(
        e,
        `请提供一次性密钥哦！\n格式：/${getCmdHead()} bind otk_xxx`
      )
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
      await send.send_with_At(e, '你当前没有绑定平台，无需解绑。')
      return true
    }

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
      await send.send_with_At(
        e,
        `你还没有绑定平台哦。\n用法：/${getCmdHead()} bind otk_xxx [备注]\n说明：otk_xxx 需要从平台登录后获取一次性密钥。`
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

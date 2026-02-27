import { segment } from "oicq";
import common from "../../../lib/common/common.js";
import logger from "../components/Logger.js";
import { getPlatformBind } from "./platformBindStore.js";
import fCompute from "./fCompute.js";
import { getRizlineRecord } from "./platformApi.js";

export default class send {

    /**
     * 私聊省略@
     * @param {*} e 
     * @param {*} msg 
     * @param {boolean} [quote=false] 是否引用回复
     * @param {{}} [data={}] recallMsg等
     */
    static async send_with_At(e, msg, quote = false, data = {}) {
        if (e.isGroup) {
            if (typeof msg == 'string') {
                return e.reply([segment.at(e.user_id), ` ${msg}`], quote, data)
            } else if (Object.prototype.toString.call(msg) == '[object Array]') {
                return e.reply([segment.at(e.user_id), ...msg], quote, data)
            } else {
                return e.reply([segment.at(e.user_id), msg], quote, data)
            }
        } else {
            return e.reply(msg, quote, data)
        }
    }

    /**
     * 转发到私聊
     * @param {any} e 消息数组e
     * @param {any} msg 发送内容
     */
    static async pick_send(e, msg) {
        try {
            // @ts-ignore
            await Bot.pickMember(e.group_id, e.user_id).sendMsg(msg)
            await common.sleep(500)
        } catch (err) {
            logger.error(err)
            this.send_with_At(e, `转发失败QAQ！请尝试在私聊触发命令！`)
        }
    }


    /**
     * 转发到私聊
     * @param {any} e 消息数组e
     * @return {Promise<GameData|null>}
     */
    static async get_record(e) {


        const bind = await getPlatformBind(e.user_id)
        if (!bind?.sessionToken) {
            await this.send_with_At(
                e,
                `你还没有绑定平台哦。\n请先：/${fCompute.getCmdHead()} bind otk_xxx\n然后再发送：/update`
            )
            return null;
        }

        let data
        try {
            data = await getRizlineRecord(bind.sessionToken)
        } catch (/**@type {any} */ err) {
            const apiData = err?.response?.data
            const status = err?.response?.status
            const msg = apiData?.message || err?.message || String(err)

            if (status === 401 && apiData?.needVerifyCode) {
                await this.send_with_At(
                    e,
                    `存档更新失败：请在任意设备使用验证码登录后重试。`
                )
                return null
            }

            await this.send_with_At(e, `存档更新失败：${msg}`)
            return null
        }

        /** @type {any} */
        let record = data?.record
        if (!record) {
            await this.send_with_At(e, '存档更新失败：平台返回数据异常（缺少 record）。')
            return null
        }

        // 平台可能返回解密后的对象，也可能返回 JSON 字符串
        if (typeof record === 'string') {
            const parsed = fCompute.safeJsonParse(record)
            if (parsed && typeof parsed === 'object') record = parsed
        }

        if (!record || typeof record !== 'object') {
            await this.send_with_At(e, '存档更新失败：平台返回 record 格式异常。')
            return null
        }

        return record
    }

}

import { segment } from "oicq";
import common from "../../../lib/common/common.js";
import logger from "../components/Logger.js";

class send {

    /**
     * 私聊省略@
     * @param {*} e 
     * @param {*} msg 
     * @param {boolean} [quote=false] 是否引用回复
     * @param {{}} [data={}] recallMsg等
     */
    async send_with_At(e, msg, quote = false, data = {}) {
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
    async pick_send(e, msg) {
        try {
            // @ts-ignore
            await Bot.pickMember(e.group_id, e.user_id).sendMsg(msg)
            await common.sleep(500)
        } catch (err) {
            logger.error(err)
            this.send_with_At(e, `转发失败QAQ！请尝试在私聊触发命令！`)
        }
    }

}

export default new send()

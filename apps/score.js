import { Config } from '../components/index.js'
import rizPluginBase from '../components/baseClass.js'
import getBanGroup from '../model/getBanGroup.js'
import getInfo from '../model/getInfo.js'
import fCompute from '../model/fCompute.js'
import picmodle from '../model/picmodle.js'
import send from '../model/send.js'
import { getPlatformBind } from '../model/platformBindStore.js'
import { getRecordCache } from '../model/platformRecordStore.js'

/** @import { botEvent } from '../components/baseClass.js' */


export class rizscore extends rizPluginBase {
	constructor() {
		super({
			name: 'riz-b40',
			dsc: '展示存档中的 b40（levelsRks）',
			event: 'message',
			priority: 999,
			rule: [
				{
					reg: `^[#/](${getCmdHead()})(\\s*)(b40|B40)$`,
					fnc: 'b40'
				},
				{
					reg: `^[#/](b40|B40)$`,
					fnc: 'b40'
				}
			]
		})
	}

	/**
	 * /b40：从缓存存档 levelsRks 生成并渲染 b40 图
	 * @param {botEvent} e
	 */
	async b40(e) {
		if (await getBanGroup.get(e, 'b40')) {
			await send.send_with_At(e, '这里被管理员禁止使用 b40 功能了呐QAQ！')
			return true
		}
		
		const record = await send.get_record(e);
		if (!record) {
			return true;
		}

		const levelsRks = Array.isArray(record?.levelsRks) ? record.levelsRks : null
		if (!levelsRks) {
			await send.send_with_At(e, '存档中缺少 levelsRks，无法生成 b40。请先游玩曲目后重试。')
			return true
		}

		const top = [...levelsRks]
			.filter((x) => x && typeof x === 'object')
			.sort((a, b) => Number(b?.rks || 0) - Number(a?.rks || 0))
			.slice(0, 40)

		const fallbackIll = (() => {
			const firstId = normalizeTrackId(top?.[0]?.trackId) || 'PastelLines.RekuMochizuki.0'
			try {
				// @ts-ignore
				return getInfo.getill(firstId)
			} catch {
				return ''
			}
		})()

		const bio1 = getInfo.getBioTitle(record?.rizcard?.bioId1)
		const bio2 = getInfo.getBioTitle(record?.rizcard?.bioId2)

		const totalRksStr = toFixed2(record?.totalRks)
		const [rksInt, rksFrac] = totalRksStr.split('.')

		const playerInfo = {
			avatar: getInfo.getillAny(record?.rizcard?.avatarId),
			avaPoz: record.rizcard.avatarPos || { x: 0, y: 0, z: 1 },
			bg: getInfo.getillAny(record?.rizcard?.backgroundId),
			name: String(record?.username || record?.userId || e.user_id),
			bio1: bio1 || '',
			bio2: bio2 || '',
			rks: {
				int: rksInt || '0',
				float: `.${rksFrac || '00'}`
			}
		}

		const songList = top.map((item) => {
			const trackId = normalizeTrackId(item?.trackId)
			const level = normalizeDifficulty(item?.difficultyClassName)
			// @ts-ignore
			const info = trackId ? getInfo.info(trackId) : null
			const chart = info?.chart?.[level]
			const diff = chart?.diff

			let rksMax = Number(item?.rks || 0)
			if (chart && typeof diff === 'number') {
				rksMax = fCompute.rks(
					120,
					diff,
					level,
					chart?.rizHitCount,
					chart?.rizHitCount,
					chart?.hitCount,
					chart?.hitCount
				)
			}

			return {
				// @ts-ignore
				ill: trackId ? getInfo.getill(trackId) : fallbackIll,
				level,
				diff: typeof diff === 'number' ? diff.toFixed(1) : '',
				name: String(info?.name || trackId || item?.trackId || ''),
				rks: toFixed2(item?.rks),
				rksMax: toFixed2(rksMax)
			}
		})

		const background = getInfo.getill(getInfo.idList[Math.floor(Math.random() * getInfo.idList.length)]);

		await send.send_with_At(e, await picmodle.common(e, 'b40', { playerInfo, songList, background }))
		return true
	}
}


function getCmdHead() {
	return Config.getUserCfg('config', 'cmdhead')
}

/**
 * @param {unknown} trackId
 */
function normalizeTrackId(trackId) {
	const id = String(trackId || '').trim()
	if (!id) return ''
	return id.startsWith('track.') ? id.slice('track.'.length) : id
}

/**
 * @param {unknown} difficulty
 * @returns {'EZ'|'HD'|'IN'|'AT'}
 */
function normalizeDifficulty(difficulty) {
	const d = String(difficulty || '').toUpperCase().trim()
	if (d === 'EZ' || d === 'HD' || d === 'IN' || d === 'AT') return d
	return 'IN'
}

/**
 * @param {number} value
 */
function toFixed2(value) {
	const n = Number(value)
	return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}
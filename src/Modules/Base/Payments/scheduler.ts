import App from "../../../App"
import Logger from "../../../types/Logger"
import Task from "../../../types/Task";
import { TaskHandlerArgs } from "../../../types/TypeAlias";
import { getCost } from "./plans";
import QueryString from "qs";
import axios, { Axios } from "axios";
import pingOutBot from "./pingOutBot";
import updateSubscribtion from "./updateSubscribtion";

export default (app: App, logger: Logger) => {
	function getDate(date: Date, { gap = 0 }: { gap?: number } = {}) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + gap, 23, 59, 59, 999)
	}

	let updateRange = 1000 * 60
	let paymentBot = new Axios({
		headers: {
			Token: "123",
			"content-type": 'application/x-www-form-urlencoded'
		},
		baseURL: "http://localhost:4000"
	})
	let pingBot = pingOutBot(paymentBot)
	let subReminder = new Task(
		"Subscription Reminder",
		async ({ fireDate, logger }: TaskHandlerArgs) => {
			let expiringSubs = await app.prisma.subscription.findMany({
				where: {
					ends: {
						lt: new Date(fireDate.getTime() + updateRange),
						gt: getDate(fireDate)
					},
					status: "active"
				},
				select: {
					ends: true,
					user: {
						select: {
							discord: true,
							balance: true,
							nextPlan: true,
						}
					}
				}
			})
			if (expiringSubs.length == 0) return logger.Debug("Expiring Subs Empty.")
			logger.Debug("Expiring Subs", expiringSubs)
			let data = expiringSubs
				.map(s => ({
					plan: s.user.nextPlan,
					proceed: s.user.balance > getCost(s.user.nextPlan),
					discord: s.user.discord,
					balance: s.user.balance
				}))
				.filter(s => !s.proceed)

			let reqData = data.map(u => ({
				"discord-id": u.discord,
				"msg-arg": `${getCost(u.plan) - u.balance}`,
				"type-msg": "must-to-pay:03"
			}))
			logger.Debug("Req Data:", reqData)
			logger.Debug("Payments Bot returned...", (
				await paymentBot.post(
					"/api/send",
					QueryString.stringify({
						USER_IDS: JSON.stringify(reqData)
					}))
			).data)
		}
	)
	let subRenewal = new Task(
		"Subscription Renewal",
		async ({ fireDate, logger }: TaskHandlerArgs) => {
			let expiredSubs = (await app.prisma.subscription.findMany({
				where: {
					ends: {
						lte: getDate(fireDate, {}),
					},
					status: "active"
				},
				select: {
					id: true,
					ends: true,
					user: {
						select: {
							discord: true,
							id: true,
							nextPlan: true,
							balance: true,
							nextPromo: true,
						},
					}
				}
			})).map(s => ({
				sid: s.id,
				start: s.ends,
				...s.user,
				proceeded: s.user.balance > getCost(s.user.nextPlan)
			}))
			if (expiredSubs.length == 0) return logger.Log("No subscriptions to update")

			expiredSubs.map(updateSubscribtion(app,logger))

			let proceededSubs = expiredSubs.filter(s => s.proceeded)
			let unproceededSubs = expiredSubs.filter(s => !s.proceeded)
			let reqData = [
				...proceededSubs.map(u => ({
					"discord-id": u.discord,
					"msg-arg": `${getCost(u.nextPlan)}`,
					"type-msg": "must-to-pay:02"
				})),
				...unproceededSubs.map(u => ({
					"discord-id": u.discord,
					"msg-arg": `${getCost(u.nextPlan) - u.balance}`,
					"type-msg": "must-to-pay:01"
				}))
			]
			logger.Debug("ReqData (processing NEW subs):", reqData)
			logger.Debug("Payments Bot returned...", (
				await paymentBot.post(
					"/api/send",
					QueryString.stringify({
						USER_IDS: JSON.stringify(reqData)
					}))).data)
		}
	)
	subReminder.schedule('* * */10 * * *', logger)
	subRenewal.schedule('* * */10 * * *', logger)
	pingBot.schedule('* */10 * * *', logger)
}

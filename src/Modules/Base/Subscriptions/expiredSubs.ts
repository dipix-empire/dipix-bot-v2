import { Axios } from "axios"
import App from "../../../App"
import Task from "../../../types/Task"
import { TaskHandlerArgs } from "../../../types/TypeAlias"
import { getCost } from "./plans"
import updateSubscribtion from "./updateSubscribtion"
import { getDate } from "./util"
import QueryString from "qs";

export default (app: App, paymentBot: Axios) => {
	return new Task(
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

			expiredSubs.map(updateSubscribtion(app, logger))

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
}

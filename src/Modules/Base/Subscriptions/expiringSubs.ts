import { Axios } from "axios";
import App from "../../../App";
import Task from "../../../types/Task";
import { TaskHandlerArgs } from "../../../types/TypeAlias";
import { getCost } from "./plans";
import { getDate, updateRange } from "./util";
import QueryString from "qs";

export default (app: App, paymentBot: Axios) => {
	return new Task(
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
}

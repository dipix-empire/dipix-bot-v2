import { Plan } from "@prisma/client"
import { InfoEmbed } from "../../../../Data/Embeds"
import Task from "../../../../types/Task"
import { TaskHandlerArgs } from "../../../../types/TypeAlias"
import { getPlanDetail } from "../plans"
import { getDate } from "../util"
import { Module } from "../../../../types/Module"

export default (module: Module) => {
	return new Task("Reminder", async ({ fireDate }: TaskHandlerArgs) => {
		let expiringSubs = await module.app.prisma.subscription.findMany({
			where: {
				ends: {
					lt: getDate(fireDate, { gap: 3 }),
					gte: getDate(fireDate)
				},
				status: "active"
			},
			select: {
				id: true,
				ends: true,
				plan: true,
				promo: true,
				user: {
					select: {
						discord: true,
						balance: true,
						nextPlan: true
					}
				}
			}
		})
		expiringSubs.map(async s => {
			try {
				let user = await module.app.bot.users.fetch(s.user.discord)
				if ((s.user.nextPlan != s.plan) && (s.user.balance >= getPlanDetail(s.user.nextPlan).cost)) return
				await user.send({
					embeds: [
						InfoEmbed(
							"Ваша подписка истекает!",
							`Ваша подписка истекает через ${getMessageFormatByDayCount(getDaysBeetwenDates(fireDate, s.ends))}, ${getReasonOfMessage(s.plan, s.user.nextPlan, s.user.balance)}!`
						)
					]
				})
			} catch (err) {
				module.logger.VerboseError(err, `Error while listing expiring subscription ${s.id} for user ${s.user.discord}`)
			}
		})
		function getMessageFormatByDayCount(count: number) {
			if (count == 0) return 'сегодня'
			if (count == 1) return ''
			return `через ${count} дн${count > 4 ? 'ей' : 'я'}`
		}
		function getDaysBeetwenDates(start: Date, end: Date) {
			return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
		}
		function getReasonOfMessage(current: Plan, next: Plan, balance: number) {
			const changePlanMessage = `следующий тариф сменится с \`${getPlanDetail(current).name}\` на \`${getPlanDetail(next).name}\``;
			const notEnoughBalanceMessage = `но на балансе не хватает средств (необходимо $${getPlanDetail(next)}, на балансе $${balance})`;
			if ((next != current) && (balance >= getPlanDetail(current).cost))
				return changePlanMessage + `, ` + notEnoughBalanceMessage
			if (next != current)
				return changePlanMessage
			if (balance >= getPlanDetail(current).cost)
				return notEnoughBalanceMessage
		}
	})
}

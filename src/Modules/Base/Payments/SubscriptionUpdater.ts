import App from "../../../App"
import Logger from "../../../types/Logger"
import { RecurrenceRule, scheduleJob } from "node-schedule"
import { SubscriptionStatus, User } from "@prisma/client"
import { WarnEmbed } from "../../../Data/Embeds"

export default (app: App, logger: Logger, rules: any[], updateRange: number, expireRange: number) => {
	return rules.map(e => scheduleJob("checkSubscriptions", e, async (fireDate: Date) => {
		let expiringUsers = await app.prisma.user.findMany({
			where: {
				lastUpdate: {
					"lt": new Date(fireDate.getTime() + updateRange)
				},
				status: SubscriptionStatus.active
			}
		})
		expiringUsers.forEach(async (u: User) => {
			//* Update this
			// await (await app.bot.users.fetch(u.discord)).send({
			// 	embeds: [WarnEmbed(
			// 		"Ваша подписка истекла! Убедитесь, что на вашем счету достаточно средств для списания, в противном случае доступ к серверу будет приостановлен через 10 дней!"
			// 	)]
			// })
		})
		await app.prisma.user.updateMany({
			where: {
				lastUpdate: {
					"lt": new Date(fireDate.getTime() + updateRange)
				},
				status: SubscriptionStatus.active
			},
			data: {
				status: SubscriptionStatus.expired
			}
		})
		let expiredUsers = await app.prisma.user.findMany({
			where: {
				lastUpdate: {
					"lt": new Date(fireDate.getTime() + expireRange)
				},
				status: SubscriptionStatus.expired
			}
		})
		expiredUsers.forEach(async (u: User) => {
			try {
				//* Update this
				// await (await app.bot.users.fetch(u.discord)).send({
				// 	embeds: [WarnEmbed(
				// 		"Ваша подписка истекла! Доступ к серверу приостановлен. Пополните счёт для восстановления доступа и используйте команду `/payments update` на сервере."
				// 	)]
				// })
				app.minecraft.sendToConsole(`whitelist remove ${u.nickname}`)
				let guild = app.bot.guilds.cache.get(app.config.bot.guildId)
				if (!guild) logger.Error(new Error("Cannot find base guild."))
				await (await guild?.members.fetch(u.discord))?.roles.add(app.config.modules.payments.noPaymentRole)
			} catch (err) {
				logger.Error(err)
			}
		})
	}))
}

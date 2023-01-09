import App from "../../../App"
import Logger from "../../../types/Logger"
import { RecurrenceRule, scheduleJob } from "node-schedule"
import { SubscriptionStatus, User } from "@prisma/client"
import { WarnEmbed } from "../../../Data/Embeds"
import Task from "../../../types/Task"
import { TaskHandlerArgs } from "../../../types/TypeAlias"

export default (app: App, logger: Logger, rules: any[], updateRange: number, expireRange: number) => {
	const UpdateTask = new Task(
		'Subscription Updater',
		async ({ fireDate }: TaskHandlerArgs) => {
			let expiringUsers = await app.prisma.user.findMany({
				where: {
					nextUpdate: {
						lt: new Date(fireDate.getMilliseconds() + updateRange)
					},
					status: "active"
				}
			})
			logger.Debug("Expiring Users:", expiringUsers)
			let expiredUsers = await app.prisma.user.findMany({
				where: {
					nextUpdate: {
						lt: new Date(fireDate.getMilliseconds() + expireRange)
					},
					status: "expiring"
				}
			})
			logger.Debug("Expired users:", expiredUsers)
			await app.prisma.user.updateMany({
				where: {
					nextUpdate: {
						lt: new Date(fireDate.getMilliseconds() + updateRange)
					}
				},
				data: {
					status: "expiring"
				}
			})
			await app.prisma.user.updateMany({
				where: {
					nextUpdate: {
						lt: new Date(fireDate.getMilliseconds() + expireRange)
					},
					status: "expiring"
				},
				data: {
					status: "expired"
				}
			})
		},
		logger
	)
	return rules.map(r => UpdateTask.schedule(r))
	// rules.map(e => scheduleJob("checkSubscriptions", e, async (fireDate: Date) => {
	// 	let expiringUsers = await app.prisma.user.findMany({
	// 		where: {
	// 			lastUpdate: {
	// 				"lt": new Date(fireDate.getTime() + updateRange)
	// 			},
	// 			status: SubscriptionStatus.active
	// 		}
	// 	})
	// 	expiringUsers.forEach(async (u: User) => {
	// 		//* Update this
	// 		// await (await app.bot.users.fetch(u.discord)).send({
	// 		// 	embeds: [WarnEmbed(
	// 		// 		"Ваша подписка истекла! Убедитесь, что на вашем счету достаточно средств для списания, в противном случае доступ к серверу будет приостановлен через 10 дней!"
	// 		// 	)]
	// 		// })
	// 	})
	// 	await app.prisma.user.updateMany({
	// 		where: {
	// 			lastUpdate: {
	// 				"lt": new Date(fireDate.getTime() + updateRange)
	// 			},
	// 			status: SubscriptionStatus.active
	// 		},
	// 		data: {
	// 			status: SubscriptionStatus.expired
	// 		}
	// 	})
	// 	let expiredUsers = await app.prisma.user.findMany({
	// 		where: {
	// 			lastUpdate: {
	// 				"lt": new Date(fireDate.getTime() + expireRange)
	// 			},
	// 			status: SubscriptionStatus.expired
	// 		}
	// 	})
	// 	expiredUsers.forEach(async (u: User) => {
	// 		try {
	// 			//* Update this
	// 			// await (await app.bot.users.fetch(u.discord)).send({
	// 			// 	embeds: [WarnEmbed(
	// 			// 		"Ваша подписка истекла! Доступ к серверу приостановлен. Пополните счёт для восстановления доступа и используйте команду `/payments update` на сервере."
	// 			// 	)]
	// 			// })
	// 			app.minecraft.sendToConsole(`whitelist remove ${u.nickname}`)
	// 			let guild = app.bot.guilds.cache.get(app.config.bot.guildId)
	// 			if (!guild) logger.Error(new Error("Cannot find base guild."))
	// 			await (await guild?.members.fetch(u.discord))?.roles.add(app.config.modules.payments.noPaymentRole)
	// 		} catch (err) {
	// 			logger.Error(err)
	// 		}
	// 	})
	// }))
}

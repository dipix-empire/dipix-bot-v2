import { Module } from "../../../../types/Module";
import Task from "../../../../types/Task";
import { TaskHandlerArgs } from "../../../../types/TypeAlias";
import { Sub, getDate } from "../util/util";
import { getPlanDetail } from "../util/plans";
import { ErrorEmbed, SuccesfulEmbed } from "../../../../Data/Embeds";
import Update, { UpdateResult } from "../util/update";

export default (module: Module) => {
	return new Task("Updater", async ({ fireDate, logger }: TaskHandlerArgs) => {
		logger.Log("Starting subscription update.")
		let expired = await module.app.prisma.subscription.findMany({
			where: {
				ends: {
					lt: getDate(fireDate, { gap: 1 }),
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
						id: true,
						discord: true,
						balance: true,
						nextPlan: true
					}
				}
			}
		})
		if (expired.length == 0) return logger.Log("No subscriptions to update")
		let data: Sub[] = expired.map((s) => ({
			id: s.id,
			end: s.ends,
			plan: s.plan,
			uid: s.user.id,
			nextPlan: s.user.nextPlan,
			discord: s.user.discord,
			balance: s.user.balance
		}))
		for (let i = 0; i < data.length; i++) {
			let s = data[i]
			let [res, balance] = await Update(module, s)
			const discordUser = await module.app.bot.users.fetch(s.discord);
			switch (res) {
				case UpdateResult.successful:
					return await discordUser.send({
						embeds: [
							SuccesfulEmbed(
								`С баланса списано $${getPlanDetail(s.nextPlan).cost}, 
								текущий счёт: ${balance}
								${s.plan != s.nextPlan ?
									`, план изменён с \`${getPlanDetail(s.plan).name}\` на \`${getPlanDetail(s.nextPlan).name}\`` :
									''
								}`,
								"Подписка обновлена!"
							)
						]
					})
				case UpdateResult.internalError:
					return
				case UpdateResult.notEnoughBalance:
					return await discordUser.send({
						embeds: [ErrorEmbed(
							"На балансе недостаточно средств для обновления подписки!",
							"Ваша подписка истекла!"
						)]
					})
			}
		}
	})
}

import { Plan, Subscription } from "@prisma/client";
import { Module } from "../../../../types/Module";
import Task from "../../../../types/Task";
import { TaskHandlerArgs } from "../../../../types/TypeAlias";
import { getDate } from "../util";
import { getCost, getPlanDetail } from "../plans";
import { ErrorEmbed, SuccesfulEmbed } from "../../../../Data/Embeds";

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
		await module.app.prisma.subscription.updateMany({
			where: {
				ends: {
					lt: getDate(fireDate, { gap: 1 }),
					gte: getDate(fireDate)
				},
				status: "active"
			},
			data: {
				status: "expired"
			}
		})
		data.map(async (s: Sub) => {
			const discordUser = await module.app.bot.users.fetch(s.discord);
			/**
			 * TODO: 
			 * 	1) Make sure user sub procceded
			 *  2) Notify if not and exit
			 *  3) Proceed
			 *  4) Notify user and logger
			 */

			if (s.balance < getPlanDetail(s.nextPlan).cost) 
				return await discordUser.send({
					embeds: [ErrorEmbed(
						"На балансе недостаточно средств для обновления подписки!",
						"Ваша подписка истекла!"
					)]
				})
			let newSub = await module.app.prisma.subscription.create({
				data: {
					userId: s.uid,
					plan: s.nextPlan,
					started: new Date(),
					ends: new Date(Date.now() + getPlanDetail(s.nextPlan).duration),
					status: "active"
				}
			})
			let updatedUser = await module.app.prisma.user.update({
				where: {
					id: s.uid
				},
				data: {
					balance: {
						decrement: getPlanDetail(newSub.plan).cost
					}
				}
			})
			await discordUser.send({embeds: [
				SuccesfulEmbed(
					`С баланса списано $${getPlanDetail(newSub.plan).cost}, 
					текущий счёт: ${updatedUser.balance}
					${s.plan != newSub.plan ? 
						`, план изменён с \`${getPlanDetail(s.plan).name}\` на \`${getPlanDetail(newSub.plan).name}\`` : 
						''
					}`,
					"Подписка обновлена!"
				)
			]})
		})
	})
}

export type Sub = {
	id: string,
	end: Date,
	plan: Plan,
	uid: string,
	nextPlan: Plan,
	discord: string,
	balance: number	
}

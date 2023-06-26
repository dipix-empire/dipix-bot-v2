import { ErrorEmbed, SuccesfulEmbed } from "../../../Data/Embeds";
import { Module } from "../../../types/Module";
import { getPlanDetail } from "./plans";
import { Sub } from "./util";

export default async function Update(module: Module, s: Sub) {
	try {
		const discordUser = await module.app.bot.users.fetch(s.discord);
		/**
		 * *	Outdate current sub
		 * *	Make sure user sub procceded
		 * *	Notify if not and exit
		 * *	Proceed
		 * *	Notify user and logger
		 */
		await module.app.prisma.subscription.update({
			where: { id: s.id },
			data: { status: "expired" }
		})
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
		await discordUser.send({
			embeds: [
				SuccesfulEmbed(
					`С баланса списано $${getPlanDetail(newSub.plan).cost}, 
					текущий счёт: ${updatedUser.balance}
					${s.plan != newSub.plan ?
						`, план изменён с \`${getPlanDetail(s.plan).name}\` на \`${getPlanDetail(newSub.plan).name}\`` :
						''
					}`,
					"Подписка обновлена!"
				)
			]
		})
	} catch (err) {
		module.logger.Error(err, `Error during ${s.uid} / <@${s.discord}> subscription update`)
	}
}

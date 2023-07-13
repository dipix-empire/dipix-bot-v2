import { SuccesfulEmbed, ErrorEmbed } from "../../../Data/Embeds";
import { Module } from "../../../types/Module";
import { getPlanDetail } from "./util/plans";
import Update, { UpdateResult } from "./util/update";

export default (module: Module) => {
	module.app.rest.inner("/subscription/update", async (data) => {
		try {
			let id = data?.id
			if (!id) {
				module.logger.Verbose(`Update requested but no id was provided.`)
				return { status: 400 }
			}
			let user = await module.app.prisma.user.findUnique({
				where: { id }
			})
			if (!user) {
				module.logger.Verbose(`Update requested but no user matched id.`)
				return { status: 404 }
			}
			let subs = await module.app.prisma.subscription.findFirstOrThrow({ where: { userId: user.id } })
			module.logger.Log(`Update for user ${id}/${(await module.app.bot.users.fetch(user.discord)).tag} requested.`)
			const s = {
				id: subs.id,
				end: subs.ends,
				plan: subs.plan,
				uid: user.id,
				nextPlan: user.nextPlan,
				discord: user.discord,
				balance: user.balance
			};
			let [res, balance] = await Update(module, s)
			let msg = ``
			switch (res) {
				case UpdateResult.successful:
					msg = `С баланса списано $${getPlanDetail(s.nextPlan).cost}, 
								текущий счёт: ${balance}
								${s.plan != s.nextPlan ?
							`, план изменён с \`${getPlanDetail(s.plan).name}\` на \`${getPlanDetail(s.nextPlan).name}\`` :
							''
						}`
					break
				case UpdateResult.internalError:
					return { status: 500 }
				case UpdateResult.notEnoughBalance:
					msg = "На балансе недостаточно средств для обновления подписки!"
			}
			return { status: 200, msg }
		} catch (err) {
			module.logger.Error(err, "Error while routing update")
			return { status: 500 }
		}
	})
}

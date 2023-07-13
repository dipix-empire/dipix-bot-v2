
import { ButtonInteraction, Interaction } from "discord.js";
import { Module } from "../../../../types/Module";
import { ErrorEmbed, InfoEmbed } from "../../../../Data/Embeds";
import { getPlanDetail } from "../util/plans";

export default async (module: Module, interaction: ButtonInteraction) => {
	let user = await module.app.prisma.user.findUnique({
		where: {
			discord: interaction.user.id
		}
	})
	if (!user) return ErrorEmbed("Пользователь не найден. Воспользуйтесь /join для написания заявки или дождитесь решения по текущей.")
	let subs = await module.app.prisma.subscription.findMany({
		where: {
			userId: user.id
		}
	})
	let result = InfoEmbed("Подписка", "Периоды подписки:")
	if (subs.length == 0) result.setDescription("История подписки пуста.")
	else {
		result.addFields(subs.sort((a, b) => a.started.getTime() - b.started.getTime()).slice(0, 4).map((s, k) => ({ name: getNameByIndex(k), value: `<t:${Math.floor(s.started.getTime() / 1000)}> - <t:${Math.floor(s.ends.getTime() / 1000)}>, ${getPlanDetail(s.plan).name} ($${getPlanDetail(s.plan).cost})` })))
	}
	return result
}

function getNameByIndex(id: number) {
	return !id ? "Текущий период:" : `${id} период${id > 1 ? id > 4 ? "ов" : "a" : ""} назад:`
}

import { ButtonInteraction } from "discord.js";
import { Module } from "../../../../types/Module";
import { ErrorEmbed, InfoEmbed } from "../../../../Data/Embeds";

export default async (module: Module, interaction: ButtonInteraction) => {
	await interaction.deferReply({ ephemeral: true })
	let user = await module.app.prisma.user.findUniqueOrThrow({ where: { discord: interaction.user.id } })
	let subs = await module.app.prisma.subscription.findMany({
		where: {
			userId: user.id,
			status: "active"
		}
	})
	if (subs.length > 0) return InfoEmbed("Обновление не требуется.")
	return ErrorEmbed("Не реализовано")
}

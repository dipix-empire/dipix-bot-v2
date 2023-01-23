import { ChatInputCommandInteraction } from "discord.js";
import Logger from "../../../../types/Logger";
import App from "../../../../App";
import { ErrorEmbed, SuccesfulEmbed } from "../../../../Data/Embeds";

export default async function addPromo(app: App, logger: Logger, interaction: ChatInputCommandInteraction) {
	// await app.prisma.promo
	let name = interaction.options.get("promo", true).value as string
	if (await app.prisma.promo.findFirst({ where: { name } }) != null) return await interaction.editReply({ embeds: [ErrorEmbed("Промокод уже существует.")] })
	let
		count = interaction.options.get("count", true).value as number,
		lifetime = interaction.options.get("lifetime", true).value as number,
		discount = interaction.options.get("discount", true).value as number,
		pub = !!(interaction.options.get("public")?.value as boolean | undefined)

	await app.prisma.promo.create({
		data: {
			count, lifetime, discount, name,
			public: pub,
			whoAdded: interaction.user.id
		}
	})
	//TODO: Review Promo structure
	await interaction.editReply({ embeds: [SuccesfulEmbed()] })
}

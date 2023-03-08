import { Interaction } from "discord.js";
import App from "../../../../App";
import { SuccesfulEmbed, ErrorEmbed } from "../../../../Data/Embeds";
import Logger from "../../../../types/Logger";
import DiscordEvent from "../../../../types/ModuleEvent/DiscordEvent";

export default (app: App, logger: Logger) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isModalSubmit()) return
	if (!interaction.customId.startsWith("join:bio_modal:")) return
	try {
		await interaction.deferReply({ ephemeral: true })
		let reqID = interaction.customId.split(":").pop() || ""
		let request = await app.prisma.request.findUnique({ where: { id: reqID } })
		if (!request) throw new Error("No request found")
		const biography = interaction.fields.getTextInputValue('join:biography');

		await app.prisma.request.update({ where: { id: request.id }, data: { biography: biography } })
		interaction.editReply({ embeds: [SuccesfulEmbed("Биография добавлена!")] })
	} catch (err) {
		logger.Error(err)
		interaction.replied ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : await interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})

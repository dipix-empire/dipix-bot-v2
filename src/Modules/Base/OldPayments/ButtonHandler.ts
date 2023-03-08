import App from "../../../App"
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent"
import Logger from "../../../types/Logger"
import { updatePlanActionRow } from "./ActionRows"
import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent"
import { ErrorEmbed, InfoEmbed } from "../../../Data/Embeds"
import { Interaction } from "discord.js"
export default (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isButton()) return
	if (!interaction.customId.startsWith("payments:")) return
	try {
		await interaction.deferReply({ephemeral: true})
		if (interaction.user.id != interaction.customId.split(':')[2]) return interaction.editReply({embeds:[ErrorEmbed("How did we get here?")]}) 
		let operation = interaction.customId.split(":")[1]
		let user = await app.prisma.user.findFirst({where: {discord: interaction.user.id}})
		if (!user) return await interaction.editReply({embeds:[ErrorEmbed("How did we get here?")]})
		if (operation == "updatePlan") {
			await interaction.editReply({
				embeds:[InfoEmbed("Выберите план")],
				components: [ updatePlanActionRow(interaction.user, user.plan) ]
			})
		}
	} catch(err) {
		logger.Error(err)
		interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})
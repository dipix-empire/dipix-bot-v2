import DiscordEvent from "../../../types/ModuleEvent/DiscordEvent"
import { Interaction } from "discord.js"
import { ErrorEmbed, SuccesfulEmbed } from "../../../Data/Embeds"
import { toPlanID, getPlanName } from "./PlansManipulation"
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent"
import App from "../../../App"
import Logger from "../../../types/Logger"
export default (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
	if (!interaction.isSelectMenu()) return
	if (!interaction.customId.startsWith('payments:')) return
	try {
		await interaction.deferReply({ephemeral: true})
		if (interaction.user.id != interaction.customId.split(':')[2]) 
			return interaction.editReply({embeds:[ErrorEmbed("How did we get here?")]})
		let choose = interaction.values[0]
		if (['default', 'sponsor'].indexOf(choose) == -1) return await interaction.editReply({embeds:[ErrorEmbed("Тарифный план не найден")]})
		await app.prisma.user.update({where:{discord: interaction.user.id}, data:{plan: toPlanID(choose)}})
		await interaction.editReply({embeds:[SuccesfulEmbed("План обновлён!").setDescription(`Новый план: ${getPlanName(toPlanID(choose))}`)]})
	} catch(err) {
		logger.Error(err)
		interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
	}
})

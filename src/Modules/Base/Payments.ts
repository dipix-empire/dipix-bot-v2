import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { Plan } from "@prisma/client"
import { CommandInteraction, Interaction, MessageEmbed } from "discord.js"
import App from "../../App"
import { ErrorEmbed, InfoEmbed, SuccesfulEmbed } from "../../Data/Embeds"
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent"
import Logger from "../../types/Logger"
import Module from "../../types/Module"
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent"
export default new Module(
	"payments",
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		app.bot.uploadCommand(app.config.bot.guildId, (slashCommandBuilder: SlashCommandBuilder) => 
			slashCommandBuilder
				.setName("payments")
				.setDescription("Управление балансом и подпиской.")
		)
		function getPlanName(plan: Plan) {
			switch(plan) {
				case 'default':
					return 'Стандартный'
				case 'sponsor':
					return 'Спонсорский'
			}
		}
		return [
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand() || interaction.commandName != "payments") return
				try {
					await interaction.deferReply({ephemeral: true})
					let cmd = interaction as CommandInteraction		
					let user = await app.prisma.user.findFirst({where:{discord: interaction.user.id}})
					if (!user) return await cmd.editReply({embeds:[ErrorEmbed("Пользователь не найден.")]})			
					await cmd.editReply({
						embeds: [
							InfoEmbed("Информация о Вашем счёте")
							.addField('Баланс', `${user.balance}$`)
							.addField('Тариф', `${getPlanName(user.plan)}`)
						]
					})
				} catch (err) {
					logger.Error(err)
					interaction.replied || interaction.deferred ? await interaction.editReply({ embeds: [ErrorEmbed()] }) : interaction.reply({ embeds: [ErrorEmbed()], ephemeral: true })
				}
			})
		]
	}
)
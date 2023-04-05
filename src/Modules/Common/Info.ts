import { Interaction } from "discord.js"
import App from "../../App"
import Discord from "../../Clients/Discord"
import { ErrorEmbed, InfoEmbed } from "../../Data/Embeds"
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent"
import Logger from "../../types/Logger"
import ModuleBuilder from "../../types/Module"
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent"
import Task from "../../types/Task"
import { TaskHandlerArgs } from "../../types/TypeAlias"

export default new ModuleBuilder(
	"info",
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		const test = new Task("test-task", ({}: TaskHandlerArgs) => {
			logger.Log("TEST LOG")
		})
		// test.schedule("*/30 * * * * *", logger)
		return [
			new DiscordEvent("interactionCreate", async (interaction: Interaction) => {
				if (!interaction.isCommand()) return
				if (interaction.commandName != "bot") return
				try {
					await interaction.deferReply({ ephemeral: true })
					await interaction.editReply({
						embeds: [
							InfoEmbed("Информация о боте", "Бот разработан Philainel специально для проекта DiPix. Все права защищены.")
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

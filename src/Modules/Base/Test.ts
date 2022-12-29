import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { v4 } from "uuid";
import App from "../../App";
import { ErrorEmbed, SuccesfulEmbed } from "../../Data/Embeds";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new Module(
	"test",
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		logger.Verbose(app.bot.uploadCommand("main", (slashCommand: SlashCommandBuilder) =>
			slashCommand
				.setName("test")
				.setDescription("Тест для модераторов.")
		))
		return [
			new DiscordEvent("interaction", async (interaction: CommandInteraction) => {
				if (!interaction.isCommand()) return
				if (interaction.commandName != "test") return
				try {
					await interaction.deferReply()
					appBusModule.send('conversation', {type: 'test', user: interaction.user.id, id: v4()})
					await interaction.editReply({embeds:[SuccesfulEmbed("Тест начат.")]})
				} catch(err) {
					logger.Error(err)
					interaction.editReply({embeds:[ErrorEmbed()]})
				}
			})
		]
	}
)

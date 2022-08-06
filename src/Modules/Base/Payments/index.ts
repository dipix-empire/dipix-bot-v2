import { SlashCommandBuilder } from "@discordjs/builders"
import App from "../../../App"
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent"
import Logger from "../../../types/Logger"
import Module from "../../../types/Module"
import ButtonHandler from "./ButtonHandler"
import CommandHandler from "./CommandHandler"
import SelectMenuHandler from "./SelectMenuHandler"

export default new Module(
	"payments",
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		app.bot.uploadCommand(app.config.bot.guildId, (slashCommandBuilder: SlashCommandBuilder) =>
			slashCommandBuilder
				.setName("payments")
				.setDescription("Управление балансом и подпиской.")
		)

		return [
			CommandHandler(app, appBusModule, logger),
			ButtonHandler(app, appBusModule, logger),
			SelectMenuHandler(app, appBusModule, logger)
		]
	}
)
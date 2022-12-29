import { SlashCommandBuilder } from "@discordjs/builders"
import App from "../../../App"
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent"
import Logger from "../../../types/Logger"
import Module from "../../../types/Module"
import AccessCheck from "./AccessCheck"
import ButtonHandler from "./ButtonHandler"
import CommandHandler from "./CommandHandler"
import SelectMenuHandler from "./SelectMenuHandler"
import SubscriptionUpdater from "./SubscriptionUpdater"

export default new Module(
	"payments",
	(app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
		logger.Verbose(app.bot.uploadCommand("main", (slashCommandBuilder: SlashCommandBuilder) =>
			slashCommandBuilder
				.setName("payments")
				.setDescription("Управление балансом и подпиской.")
		))
		let times = []
		for (let i = 0; i < 24; i++)
			for (let j = 0; j < 60; j+=10)
				times.push({
					hours: i,
					minutes: j
				})
		//TODO: Change to config data!
		SubscriptionUpdater(app, logger, [times], 1000 * 60 * 10, 0)

		return [
			CommandHandler(app, appBusModule, logger),
			ButtonHandler(app, appBusModule, logger),
			SelectMenuHandler(app, appBusModule, logger),
			AccessCheck(app, appBusModule, logger)
		]
	}
)

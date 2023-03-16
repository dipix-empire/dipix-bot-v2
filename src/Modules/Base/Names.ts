import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import Module from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Task from "../../types/Task";
import { TaskHandlerArgs } from "../../types/TypeAlias";

export default new Module("names", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
	if (!app.config.modules.names.enabled) { logger.Warn("Disabling module due to config value."); return [] }
	let changeTask = new Task("Change Name", async ({ logger }: TaskHandlerArgs) => {
		let config = app.config.modules.names
		let name = `${config.emoji} ${config.content[Math.floor(Math.random() * config.content.length)]}`
		await (await app.bot.mainGuild()).setName(name, "Change due to autochange")
	})
	return [new DiscordEvent("ready", () => {
		changeTask.schedule(app.config.modules.names.rule, logger)
	})]
})

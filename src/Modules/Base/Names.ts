import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";
import Task from "../../types/Task";
import { TaskHandlerArgs } from "../../types/TypeAlias";

export default new ModuleBuilder("names", (module: Module) => {
	if (!module.app.config.modules.names.enabled) { module.logger.Warn("Disabling module due to config value."); return module }
	let changeTask = new Task("Change Name", async ({ logger }: TaskHandlerArgs) => {
		let config = module.app.config.modules.names
		let name = `${config.emoji} ${config.content[Math.floor(Math.random() * config.content.length)]}`
		await (await module.app.bot.mainGuild()).setName(name, "Change due to autochange")
	})
	module.addEvent(new DiscordEvent("ready", () => {
		changeTask.schedule(module.app.config.modules.names.rule, module.logger)
	}))
	return module
})

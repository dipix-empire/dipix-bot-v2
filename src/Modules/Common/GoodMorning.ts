import { Message } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import ModuleBuilder from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new ModuleBuilder("GoodMorning", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
	let emojis = app.config.modules.goodmorning.emojis
	if (!emojis) {
		logger.Warn("No emojis provided, disabling module.")
		return []
	}
	return [
		new DiscordEvent("messageCreate", async (msg: Message) => {
			try {
				if (!msg.content.match(app.config.modules.goodmorning.regex)?.length) return // logger.Debug("RegExp test returned false")
				if (!msg.content.match(app.config.modules.goodmorning.regex)?.length) return // logger.Debug("RegExp test returned false")
				let emoji = emojis[Math.floor(Math.random() * emojis.length)]
				await msg.react(emoji)
				logger.Debug("Emoji picked...", emoji)
			} catch (err) {
				logger.Error(err)
			}
		})
	]
})

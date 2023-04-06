import { Message } from "discord.js";
import App from "../../App";
import AppBusModuleComponent from "../../types/AppBus/ModuleComponent";
import Logger from "../../types/Logger";
import ModuleBuilder, { Module } from "../../types/Module";
import DiscordEvent from "../../types/ModuleEvent/DiscordEvent";

export default new ModuleBuilder("GoodMorning", (module: Module) => {
	let emojis = module.app.config.modules.goodmorning.emojis
	if (!emojis) {
		module.logger.Warn("No emojis provided, disabling module.")
		return module
	}
	module.addEvent(
		new DiscordEvent("messageCreate", async (msg: Message) => {
			try {
				if (!msg.content.match(module.app.config.modules.goodmorning.regex)?.length) return // logger.Debug("RegExp test returned false")
				if (!msg.content.match(module.app.config.modules.goodmorning.regex)?.length) return // logger.Debug("RegExp test returned false")
				let emoji = emojis[Math.floor(Math.random() * emojis.length)]
				await msg.react(emoji)
				module.logger.Debug("Emoji picked...", emoji)
			} catch (err) {
				module.logger.Error(err)
			}
		})
	)
	return module
})

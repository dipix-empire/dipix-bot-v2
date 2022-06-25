import { Interaction } from "discord.js";
import App from "../App";
import AppBusModuleComponent from "../types/AppBus/ModuleComponent";
import Module from "../types/Module";
import DiscordEvent from "../types/ModuleEvent/DiscordEvent";

export default new Module(
	"Commands",
	(app: App, appBusModule: AppBusModuleComponent) => {
		return [
			new DiscordEvent("interactionCreate", (interaction: Interaction) => {
				if (interaction.isCommand()) {
					
				}
			})
		]
	}
)
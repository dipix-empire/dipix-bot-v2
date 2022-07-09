import ModuleEvent from ".";
import Discord from "discord.js"
export default class DiscordEvent extends ModuleEvent{
	public readonly event: keyof Discord.ClientEvents
	public readonly listener: (...data: any[]) => void | Promise<void>
	constructor(event: keyof Discord.ClientEvents, listener: (...data: any) => any) {
		super("discord")
		this.event = event
		this.listener = listener
	}
}
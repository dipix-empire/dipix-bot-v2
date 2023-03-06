import ModuleEvent from ".";
import Discord from "discord.js"
export default class DiscordEvent<T extends keyof Discord.ClientEvents> extends ModuleEvent{
	public readonly event: keyof Discord.ClientEvents
	public readonly listener: (...data: any[]) => void | Promise<void>
	constructor(event: T, listener: (...data: Discord.ClientEvents[T]) => any) {
		super("discord")
		this.event = event
		this.listener = listener as any
	}
}

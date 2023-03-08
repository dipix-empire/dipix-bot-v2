import ModuleEvent from ".";
import { MinecraftEventTypes } from "../../Clients/Minecraft";

export default class MinecraftEvent<T extends keyof MinecraftEventTypes> extends ModuleEvent {
	public readonly event: T
	public readonly listener: (...data: MinecraftEventTypes[T]) => void | Promise<void>
	constructor(event: T, listener: (...data: MinecraftEventTypes[T]) => void | Promise<void>) {
		super("minecraft")
		this.event = event
		this.listener = listener
	}
}

import { EventEmitter } from "stream"
import App from "../App"
import AppBusModuleComponent from "./AppBus/ModuleComponent"
import Logger from "./Logger"
import ModuleEvent from "./ModuleEvent"

export default class Module {
	public readonly name: string
	public readonly prepare: (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => ModuleEvent[] | Promise<ModuleEvent[]>
	constructor (name: string, prepare: (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => ModuleEvent[] | Promise<ModuleEvent[]>) {
		this.name = name
		this.prepare = prepare
	}
}
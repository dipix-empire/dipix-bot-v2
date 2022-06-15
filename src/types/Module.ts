import { EventEmitter } from "stream"
import App from "../App"
import AppBusModuleComponent from "./AppBus/ModuleComponent"
import ModuleEvent from "./ModuleEvent"

export default class Module {
	public readonly name: string
	public readonly prepare: (app: App, appBusModule: AppBusModuleComponent) => ModuleEvent[]
	constructor (name: string, prepare: (app: App, appBusModule: AppBusModuleComponent) => ModuleEvent[]) {
		this.name = name
		this.prepare = prepare
	}
}
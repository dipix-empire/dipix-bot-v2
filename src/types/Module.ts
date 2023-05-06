import { EventEmitter } from "stream"
import App from "../App"
import AppBusModuleComponent from "./AppBus/ModuleComponent"
import Logger from "./Logger"
import ModuleEvent from "./ModuleEvent"
import { Promisable } from "./TypeAlias"

export default class ModuleBuilder {
	constructor(
		public readonly name: string,
		public readonly build: (module: Module) => Promisable<Module>
	) { }
}
export class Module {

	public getEvents() { return this.events }
	public addEvent(...event: ModuleEvent[]) { this.events.push(...event) }

	constructor(
		public readonly app: App,
		public readonly appBusModule: AppBusModuleComponent,
		public readonly logger: Logger,
		private events: ModuleEvent[]
	) { }
}

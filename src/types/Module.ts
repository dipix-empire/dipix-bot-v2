import { EventEmitter } from "stream"
import App from "../App"
import ModuleEvent from "./ModuleEvent"

export default class Module {
	public readonly name: string
	public readonly prepare: (app: App) => ModuleEvent[]
	constructor (name: string, prepare: (app: App) => ModuleEvent[]) {
		this.name = name
		this.prepare = prepare
	}
}
import { EventEmitter } from "events";
import Logger from "../types/Logger";

export default class Minecraft extends EventEmitter {
	constructor(
		private readonly logger: Logger
	) { super() }
}

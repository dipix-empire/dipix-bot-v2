import { scheduleJob } from "node-schedule";
import Logger from "./Logger";
import { TaskHandlerArgs } from "./TypeAlias";

export default class Task {

	public schedule(rule: string, logger: Logger) {
		logger.Verbose(`Sheduled task ${this.name} with rule ${rule}`)
		return scheduleJob(this.name, rule, async (fireDate: Date) => {
			logger.Verbose(`Executing task ${this.name}`)
			try {
				await this.handler({fireDate, logger: logger.getChild(this.name)})
			} catch (e) {
				logger.Error(e, `Task ${this.name} thrown an error:`)
			}
		})
	}

	constructor(
		private readonly name: string,
		private readonly handler: (params: TaskHandlerArgs) => any
	) { }
}

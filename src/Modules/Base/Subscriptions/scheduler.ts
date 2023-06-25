import { Module } from "../../../types/Module";
import reminder from "./tasks/reminder";
import updater from "./tasks/updater";

export default (module: Module) => {
	reminder(module).schedule(module.app.config.modules.payments.updateTimes.reminder, module.logger)
	updater(module).schedule(module.app.config.modules.payments.updateTimes.renewal, module.logger)
}

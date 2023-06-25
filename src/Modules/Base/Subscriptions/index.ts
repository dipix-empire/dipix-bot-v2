import ModuleBuilder, { Module } from "../../../types/Module";
import subscription from "./commands/subscription";
import scheduler from "./scheduler";
import reminder from "./tasks/reminder";

export default new ModuleBuilder("subscriptions", (module: Module) => {
	
	subscription(module) // Command /subscription
	scheduler(module)    // Tasks initiator

	return module
})

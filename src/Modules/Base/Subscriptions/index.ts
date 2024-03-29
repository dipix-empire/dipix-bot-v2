import ModuleBuilder, { Module } from "../../../types/Module";
import buttons from "./buttons";
import subscription from "./commands/subscription";
import inner from "./inner";
import scheduler from "./scheduler";

export default new ModuleBuilder("subscriptions", (module: Module) => {
	
	subscription(module)	// Command /subscription
	scheduler(module)		// Tasks initiator
	inner(module)			// Inner api routes
	buttons(module)
	
	return module
})

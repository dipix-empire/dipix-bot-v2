import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import Module from "../../../types/Module";
import scheduler from "./scheduler";

export default new Module("subscriptions", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
	
	scheduler(app, logger)

	return []
})

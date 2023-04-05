import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import ModuleBuilder from "../../../types/Module";
import scheduler from "./scheduler";

export default new ModuleBuilder("subscriptions", (app: App, appBusModule: AppBusModuleComponent, logger: Logger) => {
	
	scheduler(app, logger)

	return []
})

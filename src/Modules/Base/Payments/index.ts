import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import Module from "../../../types/Module";
import donate from "./donate";
import profile from "./profile";
import scheduler from "./scheduler";


export default new Module(
	"payments",
	(app: App, appBusModuleComponent: AppBusModuleComponent, logger: Logger) => {

		scheduler(app, logger)

		return [profile(app, logger), donate(app, logger)]
	}
)

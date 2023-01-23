import App from "../../../App";
import AppBusModuleComponent from "../../../types/AppBus/ModuleComponent";
import Logger from "../../../types/Logger";
import Module from "../../../types/Module";
import donate from "./donate";
import manage from "./manage";
import profile from "./profile";
import promoManager from "./promo";
import scheduler from "./scheduler";


export default new Module(
	"payments",
	(app: App, appBusModuleComponent: AppBusModuleComponent, logger: Logger) => {

		scheduler(app, logger)

		return [
			profile(app, logger), 
			donate(app, logger),
			...manage(app, logger),
			...promoManager(app, logger)
		]
	}
)

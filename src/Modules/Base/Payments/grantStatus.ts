import { User } from "@prisma/client"
import App from "../../../App"

export type PlayerStatus =
	"ban" |
	"none" |
	"accessed" |
	"sponsor"

export default async (app: App, player: {discord: string, nickname: string, id: string}, status: PlayerStatus = "accessed"): Promise<boolean> => {
	switch (status) {
		case "none":
			// TODO: REVOKE ACCESS AND ROLES
			return true
		case "accessed":
			// TODO: GRANT ACCESS AND PLAYER ROLE
			return true
		case "sponsor":
			// TODO: GRANT ACCESS AND SPONSOR ROLE
			return true
		case "ban":
			// TODO: BAN PLAYER AND GIVE ROLE
			return true

	}
}

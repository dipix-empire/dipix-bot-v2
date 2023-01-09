import { Plan } from "@prisma/client";

export function getName(plan: Plan) {
	switch (plan) {
		case "sponsor":
			return "Спонсорский"
		case "default":
			return "Стандартный"
		default:
			throw new Error("Unknown plan name.")
	}
}

export function getCost(plan: Plan) {
	switch (plan) {
		case "sponsor":
			return 2
		case "default":
			return 0.2
		default:
			throw new Error("Unknown plan cost.")
	}
} 

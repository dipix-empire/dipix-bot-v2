import { Plan } from "@prisma/client"

export function getPlanName(plan: Plan) {
	switch(plan) {
		case 'default':
			return 'Стандартный'
		case 'sponsor':
			return 'Спонсорский'
	}
}
export function toPlanID(name: string) {
	switch (name) {
		case 'sponsor':
			return Plan.sponsor
		default:
			return Plan.default
	}
}
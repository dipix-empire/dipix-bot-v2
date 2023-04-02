export function getDate(date: Date, { gap = 0 }: { gap?: number } = {}) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + gap, 23, 59, 59, 999)
}
export let updateRange = 1000 * 60

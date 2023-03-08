export default interface Message {
	sender: string,
	uuid: string
	data: any,
	recipient: string
}
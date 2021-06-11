export default class NotificationEvent {
  constructor(content: string, type: string) {
    this.content = content;
    this.type = type;
  }

  content: string = '';
  type: string = '';
}
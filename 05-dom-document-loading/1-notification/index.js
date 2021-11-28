export default class NotificationMessage {
  static visibleNotification = null;

  constructor(str = '', {duration = 0, type = ''} = {}) {
    this.str = str;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.str}
        </div>
      </div>
    </div>
    `
  }

  show(parentElement = document.body) {
    if (NotificationMessage.visibleNotification !== null) {
      NotificationMessage.visibleNotification.remove();
    }

    parentElement.append(this.element);
    NotificationMessage.visibleNotification = this;
    setTimeout(() => this.remove(), this.duration);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

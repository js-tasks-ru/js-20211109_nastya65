class Tooltip {
  offset = 10;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  render(message) {
    const element = document.createElement('div');
    element.innerHTML = this.template(message);
    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  template(message) {
    return `<div class="tooltip">${message}</div>`;
  }

  showTooltip = (event) => {
    if (event.target.dataset.tooltip !== undefined) {
      this.render(event.target.dataset.tooltip);
      this.changeTooltipPosition(this.element, event);
    }
  }

  hideTooltip = (event) => {
    if (event.target.dataset.tooltip !== undefined) {
      this.remove();
    }
  }

  moveTooltip = (event) => {
    if (event.target.dataset.tooltip !== undefined) {
      this.changeTooltipPosition(this.element, event);
    }
  }

  changeTooltipPosition(elem, event) {
    elem.style.top = `${event.clientY + this.offset}px`;
    elem.style.left = `${event.clientX + this.offset}px`;
  }

  initialize() {
    document.addEventListener('pointerover', this.showTooltip);
    document.addEventListener('pointerout', this.hideTooltip);
    document.addEventListener('pointermove', this.moveTooltip);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerover', this.showTooltip);
    document.removeEventListener('pointerout', this.hideTooltip);
    document.removeEventListener('pointermove', this.moveTooltip);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;

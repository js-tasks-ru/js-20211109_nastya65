export default class SortableList {
  listItem = '';
  placeholder = '';

  constructor ({items = []}) {
    this.items = items;
    this.render();
  }

  render() {
    const element = document.createElement('ul');
    element.classList.add('sortable-list');
    element.innerHTML = this.template;
    this.element = element;

    this.initialize();
  }

  get template() {
    return this.items.map(elem => {
      elem.classList.add('sortable-list__item');
      return elem.outerHTML;
    }).join('');
  }

  enableDraggingForElem = (event) => {
    if (event.target.dataset.grabHandle !== '') return;
    this.listItem = event.target.closest('.sortable-list__item');

    const properties = this.listItem.getBoundingClientRect();
    this.placeholder = this.createPlaceholder(this.listItem, properties);
    this.updateDraggingElem(this.listItem, properties);
    this.moveAt(event.pageX, event.pageY, event);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  moveAt(pageX, pageY, event) {
    const shiftX = event.clientX - this.listItem.getBoundingClientRect().left;
    const shiftY = event.clientY - this.listItem.getBoundingClientRect().top;
    this.listItem.style.left = pageX - shiftX + 'px';
    this.listItem.style.top = pageY - shiftY + 'px';
  }

  onPointerMove = (event) => {
    this.moveAt(event.pageX, event.pageY, event);
    this.listItem.style.display = 'none';
    const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    this.listItem.style.display = 'flex';

    if (!elemBelow) return;

    const droppableBelow = elemBelow.closest('.sortable-list__item');
    if (droppableBelow) {
      if (droppableBelow.getBoundingClientRect().top > this.placeholder.getBoundingClientRect().top) {
        droppableBelow.after(this.placeholder);
      } else {
        droppableBelow.before(this.placeholder);
      }
    }
  }

  onPointerUp = () => {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.listItem.classList.remove('sortable-list__item_dragging');
    this.listItem.style = '';
    this.placeholder.before(this.listItem);
    this.placeholder.remove();
  }

  createPlaceholder(listItem, properties) {
    const placeholder = document.createElement('li');
    placeholder.classList.add('sortable-list__placeholder');
    placeholder.style.width = properties.width + 'px';
    placeholder.style.height = properties.height + 'px';
    listItem.before(placeholder);
    return placeholder;
  }

  updateDraggingElem(listItem, properties) {
    listItem.classList.add('sortable-list__item_dragging');
    listItem.style.width = properties.width + 'px';
    listItem.style.top = properties.top + 'px';
    listItem.style.left = properties.left + 'px';
    this.element.append(listItem);
  }

  deleteElem(event) {
    if (event.target.dataset.deleteHandle !== '') return;
    const listItem = event.target.closest('.sortable-list__item');
    listItem.remove();
  }

  initialize() {
    document.addEventListener('pointerdown', this.enableDraggingForElem);
    document.ondragstart = () => false;
    document.addEventListener('pointerdown', this.deleteElem);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.enableDraggingForElem);
    document.removeEventListener('pointerdown', this.deleteElem);
    this.element = null;
  }
}

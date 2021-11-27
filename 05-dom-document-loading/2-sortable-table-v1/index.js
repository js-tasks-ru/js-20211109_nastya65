export default class SortableTable {
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  update() {
    this.element.innerHTML = this.template;
    this.subElements = this.getSubElements(this.element);
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.tableHeaderTemplate}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.tableBodyTemplate}
          </div>
        </div>
      </div>
    `
  }
  get tableHeaderTemplate() {
    return this.headerConfig.map(item => {
      return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
          <span>${item.title}</span>
        </div>
      `
    }).join('');
  }

  get tableBodyTemplate() {
    return this.data.map((dataItem) => {
      return `
        <a href="/products/${dataItem.id}" class="sortable-table__row">
          ${this.tableCellTemplate(dataItem)}
        </a>
      `
    }).join('');
  }

  tableCellTemplate(dataItem) {
    return this.headerConfig.map(({id, template}) => {
      if (template) {
        return template(this.data);
      } else {
        return `<div class="sortable-table__cell">${dataItem[id]}</div>`
      }
    }).join('');
  }

  sort(field, order = 'asc') {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    if (field === 'title') {
      this.data.sort((a, b) => direction * a[field].localeCompare(b[field], ['ru', 'en']));
    } else {
      this.data.sort((a, b) => direction * (a[field] - b[field]));
    }
    this.update();
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
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

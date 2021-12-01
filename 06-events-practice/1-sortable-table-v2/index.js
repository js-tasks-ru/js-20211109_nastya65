export default class SortableTable {
  constructor(headerConfig = [], {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.order = sorted.order;

    this.sort(sorted.id);
    this.render(sorted.id);
    this.initialize();
  }

  render(id) {
    const element = document.createElement('div');
    element.innerHTML = this.template(id);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  template(id) {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.tableHeaderTemplate(id)}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.tableBodyTemplate()}
          </div>
        </div>
      </div>
    `
  }

  tableHeaderTemplate(id) {
    return this.headerConfig.map(item => {
      return `
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="${item.id === id ? this.order : ''}">
          <span>${item.title}</span>
          ${item.id === id ? this.arrowTemplate() : ''}
        </div>
      `
    }).join('');
  }

  tableBodyTemplate() {
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
        return template(dataItem.images);
      } else {
        return `<div class="sortable-table__cell">${dataItem[id]}</div>`
      }
    }).join('');
  }

  arrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `
  }

  handleEvent = event => {
    const headerCell = event.target.closest('.sortable-table__cell');
    if (headerCell) {
      if (!headerCell.closest(  '.sortable-table__header')) {
        return;
      }
      if (headerCell.dataset.sortable !== 'false') {
        this.order = this.order === 'asc' ? 'desc' : 'asc';
        this.sort(headerCell.dataset.id);
        console.log(headerCell)
        this.updateHeader(headerCell);
        console.log(headerCell)
        this.subElements.body.innerHTML = this.tableBodyTemplate();
      }
    }
  }

  updateHeader(headerCell) {
    const headerCells = this.element.querySelectorAll('[data-id]');
    headerCells.forEach(elem => elem.dataset.order = '')
    headerCell.dataset.order = this.order;
    headerCell.append(this.subElements.arrow);
  }

  sort(id = 'title') {
    let columnConfig = this.headerConfig.find(elem => elem.id === id);
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[this.order];

    if (columnConfig.sortType === 'number') {
      this.data.sort((a, b) => direction * (a[id] - b[id]));
    } else {
      this.data.sort((a, b) => direction * a[id].localeCompare(b[id], ['ru', 'en']));
    }
  }

  getSubElements() {
    const result = {};
    const subElements = this.element.querySelectorAll('[data-element]');
    for (const subElement of subElements) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  initialize() {
    this.subElements.header.addEventListener('pointerdown', this.handleEvent);
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

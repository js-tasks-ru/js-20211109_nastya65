import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {};
  loading = false;

  constructor(headerConfig, {
    data = [],
    sorted = {
      order: 'asc',
      id: headerConfig.find(item => item.sortable).id
    },
    url = '',
    isSortLocally = false,
    start = 0,
    step = 20,
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.order = sorted.order;
    this.id = sorted.id;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = this.start + this.step;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    await this.response(this.start)
      .then(data => this.data = data)
      .catch(() => console.error('Failed to load data'));
    this.update();
    this.initialize();
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.tableHeaderTemplate(this.id)}
          </div>
          <div data-element="body" class="sortable-table__body">
            ${this.tableBodyTemplate()}
          </div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
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

  async response(start) {
    this.url.searchParams.set('_sort', this.id)
    this.url.searchParams.set('_order', this.order)
    this.url.searchParams.set('_start', start)
    this.url.searchParams.set('_end', this.end)

    const tableContainer = this.element.querySelector('.sortable-table')

    tableContainer.classList.add('sortable-table_loading');
    const newData = await fetchJson(this.url);
    tableContainer.classList.remove('sortable-table_loading');
    return newData;
  }

  update() {
    this.subElements.body.innerHTML = this.tableBodyTemplate();
  }

  sortOnClient(id, order) {
    const columnConfig = this.headerConfig.find(elem => elem.id === id);
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    this.data.sort((a, b) => {
      switch (columnConfig.sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], ['ru', 'en']);
        default:
          return direction * (a[id] - b[id]);
      }
    })
  }

  async sortOnServer(id, order) {
    this.id = id;
    this.order = order;
    await this.response(this.start)
      .then(data => this.data = data)
      .catch(() => console.error('Failed to load data'));
    this.update();
  }

  onPointerDown = event => {
    const headerCell = event.target.closest('.sortable-table__header .sortable-table__cell');
    if (headerCell && headerCell.dataset.sortable !== 'false') {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
      if (this.isSortLocally) {
        this.sortOnClient(headerCell.dataset.id, this.order);
      } else {
        this.sortOnServer(headerCell.dataset.id, this.order);
      }
      this.updateHeader(headerCell);
      this.subElements.body.innerHTML = this.tableBodyTemplate();
    }
  }

  onWindowScroll = async() => {
    if (this.element.getBoundingClientRect().bottom < document.documentElement.clientHeight && !this.loading) {
      const newStart = this.end;
      this.end = newStart + this.step;

      this.loading = true;
      await this.response(newStart)
        .then(data => this.data = [...this.data, ...data])
        .catch(() => console.error('Failed to load data'));
      await this.update()
      this.loading = false;
    }
  }

  updateHeader(headerCell) {
    const headerCells = this.element.querySelectorAll('[data-id]');
    headerCells.forEach(elem => elem.dataset.order = '')
    headerCell.dataset.order = this.order;
    headerCell.append(this.subElements.arrow);
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
    this.subElements.header.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('scroll', this.onWindowScroll);
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

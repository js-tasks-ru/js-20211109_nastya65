import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({url = '', range = {}, label = '', link = '', formatHeading} = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = data => data;
    this.data = [];

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ``}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
              ${this.getContainerHeader()}
          </div>
          <div data-element="body" class="column-chart__chart">
              ${Object.values(this.data).length ? this.getContainerBody() : ``}
          </div>
        </div>
      </div>`
  }

  async response(from, to) {
    this.url.searchParams.set('from', from.toISOString())
    this.url.searchParams.set('to', to.toISOString())
    return fetchJson(this.url);
  }

  async update(from, to) {
    await this.response(from, to)
      .then(data => this.data = data)
      .catch(() => console.error('Failed to load data'));
    this.range.from = from;
    this.range.to = to;

    if (!Object.values(this.data).length) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
      this.subElements.header.innerHTML = this.getContainerHeader();
      this.subElements.body.innerHTML = this.getContainerBody();
    }
    return this.data;
  }

  getContainerHeader() {
    return this.formatHeading(Object.values(this.data).reduce((prev, current) => prev + current, 0));
  }

  getContainerBody() {
    let listChart = '';
    const arr = Object.values(this.data);
    const maxValue = Math.max(...arr);
    const scale = this.chartHeight / maxValue;

    Object.values(this.data).forEach((el) => {
      listChart += `
        <div style="--value: ${Math.floor(el * scale)}" data-tooltip="${(el / maxValue * 100).toFixed(0)}%"></div>`;
    })
    return listChart;
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

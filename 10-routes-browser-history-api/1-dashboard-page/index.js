import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  subElements = {};
  today = new Date();
  from = new Date(this.today.setMonth(this.today.getMonth() - 1));
  to = new Date();
  rangePicker = this.getRangePicker();
  ordersColumnChart = this.getOrdersColumnChart();
  salesColumnChart = this.getSalesColumnChart();
  customersColumnChart = this.getCustomersColumnChart();
  sortableTable = this.getSortableTable();

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.element.querySelector('.content__top-panel').append(this.rangePicker.element)
    this.element.querySelector('.dashboard__charts').append(this.ordersColumnChart.element)
    this.element.querySelector('.dashboard__charts').append(this.salesColumnChart.element)
    this.element.querySelector('.dashboard__charts').append(this.customersColumnChart.element)
    this.element.append(this.sortableTable.element)

    this.subElements = this.getSubElements();
    this.initialize();
    return this.element;
  }

  get template() {
    return `
      <div class="dashboard full-height flex-column">
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
        </div>
        <div class="dashboard__charts"></div>
        <h3 class="block-title">Лидеры продаж</h3>
      </div>`
  }

  getRangePicker() {
    const rangePicker = new RangePicker({
      from: this.from,
      to: this.to,
    });
    rangePicker.element.setAttribute('data-element', 'rangePicker')

    return rangePicker;
  }

  getOrdersColumnChart() {
    const ordersColumnChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from: this.from,
        to: this.to,
      },
      label: 'orders',
      link: '#',
      formatHeading: data => `$${data}`
    });
    ordersColumnChart.element.classList.add('dashboard__chart_orders');
    ordersColumnChart.element.setAttribute('data-element', 'ordersChart')

    return ordersColumnChart;
  }

  getSalesColumnChart() {
    const salesColumnChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from: this.from,
        to: this.to,
      },
      label: 'sales',
      link: '#',
      formatHeading: data => `$${data}`
    });
    salesColumnChart.element.classList.add('dashboard__chart_sales');
    salesColumnChart.element.setAttribute('data-element', 'salesChart')

    return salesColumnChart;
  }

  getCustomersColumnChart() {
    const customersColumnChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from: this.from,
        to: this.to,
      },
      label: 'customers',
      link: '#',
      formatHeading: data => `$${data}`
    });
    customersColumnChart.element.classList.add('dashboard__chart_customers');
    customersColumnChart.element.setAttribute('data-element', 'customersChart')

    return customersColumnChart;
  }

  getSortableTable() {
    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.from.toISOString()}&to=${this.to.toISOString()}`
    });
    sortableTable.element.setAttribute('data-element', 'sortableTable')

    return sortableTable;
  }

  getSubElements() {
    const result = {};
    const subElements = this.element.querySelectorAll('[data-element]');
    for (const subElement of subElements) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  update = async event => {
    const { from, to } = event.detail;
    this.from = from;
    this.to = to;

    this.sortableTable.url.searchParams.set('from', from.toISOString());
    this.sortableTable.url.searchParams.set('to', to.toISOString());
    this.sortableTable.sortOnServer('title', 'asc', 1, 21);
    this.ordersColumnChart.update(from, to);
    this.salesColumnChart.update(from, to);
    this.customersColumnChart.update(from, to);
  }

  initialize() {
    this.element.addEventListener('date-select', this.update);
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

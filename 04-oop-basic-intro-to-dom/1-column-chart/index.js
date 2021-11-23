const numberFormat = Intl.NumberFormat('en');
const chartHeight = 50;

export default class ColumnChart {
  constructor(obj = {}) {
    ({
      data: this.data = [],
      label: this.label = '',
      link: this.link = '',
      value: this.value = 0,
      formatHeading: this.formatHeading = null
    } = obj);

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.className = 'column-chart';
    element.setAttribute('style', `--chart-height: ${chartHeight}`);
    if (!this.data.length) {
      element.classList.add('column-chart_loading');
    }

    this.element = element;
    this.element.innerHTML = this.createColumnChart();
  }

  createColumnChart() {
    return `
      <div class="column-chart__title">
        Total ${this.label}
        ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ``}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
            ${this.formatHeading ? this.formatHeading(numberFormat.format(this.value)) : numberFormat.format(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
            ${this.data.length ? this.fillContainerBody() : ``}
        </div>
      </div>`
  }

  update(newData = []) {
    this.data = newData;
    const containerBody = this.element.querySelector('.column-chart__chart');
    containerBody.innerHTML = '';

    if (!this.data.length) {
      this.element.classList.add('column-chart_loading');
    } else {
      containerBody.innerHTML = this.fillContainerBody();
    }
  }

  fillContainerBody() {
    let listChart = '';
    const maxValue = Math.max(...this.data);
    const scale = chartHeight / maxValue;

    this.data.forEach((el) => {
      listChart += `
        <div style="--value: ${Math.floor(el * scale)}" data-tooltip="${(el / maxValue * 100).toFixed(0)}%"></div>`;
    })

    return listChart;
  }

  get chartHeight() {
    return chartHeight;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    delete this;
  }
}

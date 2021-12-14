import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  categories = [];
  formData = {
    title: '',
    description: '',
    images: [],
    subcategory: '',
    price: 0,
    discount: 0,
    quantity: 0,
    status: 1,
  };

  constructor (productId = '') {
    this.productId = productId;
  }

  async render () {
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId
      ? this.loadProduct()
      : Promise.resolve(this.formData);

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    if (this.productId) {
      const [newFormData] = productResponse;
      for (const key of Object.keys(this.formData)) {
        for (const [newKey, newValue] of Object.entries(newFormData)) {
          if (newKey === key) {
            this.formData[key] = newValue;
          }
        }
      }
    }
    this.categories = categoriesData;

    this.sortableList = new SortableList({
      items: this.formData.images.map(elem => this.imagesList(elem.url, elem.source))
    });

    const element = document.createElement('div');
    element.innerHTML = await this.template();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initialize();
    return this.element;
  }

  async loadProduct () {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
  }

  async loadCategories () {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input
                value="${escapeHtml(this.formData.title)}"
                id="title"
                required=""
                type="text"
                name="title"
                class="form-control"
                placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea
              id="description"
              required=""
              class="form-control"
              name="description"
              data-element="productDescription"
              placeholder="Описание товара">${escapeHtml(this.formData.description)}
            </textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              ${this.imagesTemplate()}
            </div>
            <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline">
                <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.categoriesTemplate()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input
                value="${this.formData.price}"
                id="price"
                required=""
                type="number"
                name="price"
                class="form-control"
                placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input
                value="${this.formData.discount}"
                id="discount"
                required=""
                type="number"
                name="discount"
                class="form-control"
                placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input
              value="${this.formData.quantity}"
              id="quantity"
              required=""
              type="number"
              class="form-control"
              name="quantity"
              placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить" : "Добавить"} товар
            </button>
          </div>
        </form>
      </div>
    `
  }

  categoriesList() {
    return this.categories.map(elem => {
      return elem.subcategories.map(subElem => {
        return `<option value="${subElem.id}">${elem.title} > ${subElem.title}</option>`
      })
    }).join('');
  }

  categoriesTemplate() {
    return `
      <select id="subcategory" class="form-control" name="subcategory">
        ${this.categoriesList()}
      </select>
    `
  }

  imagesList(url, source) {
    const element = document.createElement('li');
    element.className = 'products-edit__imagelist-item sortable-list__item';
    element.innerHTML = `
      <input type="hidden" name="url" value="${escapeHtml(url)}">
      <input type="hidden" name="source" value="${escapeHtml(source)}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
        <span>${escapeHtml(source)}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    `
    return element;
  }

  imagesTemplate() {
    return this.sortableList.element.outerHTML;
  }

  uploadImage = () => {
    const sortableList = this.element.querySelector('.sortable-list');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.hidden = true;
    this.element.append(fileInput);
    fileInput.click();

    this.subElements.uploadImage.classList.add('is-loading');
    this.subElements.uploadImage.disabled = true;

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: '',
        });
        const newImg = await response.json();
        sortableList.append(this.imagesList(newImg.data.link, file.name));
      } catch (error) {
        console.error('Error', error)
      }

      this.subElements.uploadImage.classList.remove('is-loading');
      this.subElements.uploadImage.disabled = false;
    });
  }

  onSubmit = event => {
    event.preventDefault();
    this.save();
  };

  async save() {
    const product = this.getFormData();

    try {
      await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent();
    } catch (error) {
      console.error('Error', error);
    }
  }

  getFormData() {
    const data = {};
    const numbersType = ['quantity', 'status', 'price', 'discount'];

    for (const key of Object.keys(this.formData)) {
      if (key !== 'images') {
        if (numbersType.includes(key)) {
          data[key] = parseInt(this.subElements.productForm.querySelector(`[name=${key}]`).value);
        } else {
          data[key] = this.subElements.productForm.querySelector(`[name=${key}]`).value;
        }
      }
    }

    const imagesList = document.body.querySelectorAll('.sortable-list__item');
    const imagesInput = Array.from(imagesList, (elem) => elem.getElementsByTagName('input'));
    data.images = imagesInput.map(elem => {
      const [ firstElem, secondElem ] = [...elem];
      const imageObj = {};
      imageObj['url'] = firstElem.value;
      imageObj['source'] = secondElem.value;
      return imageObj;
    })

    data.id = this.productId ? this.productId : '';

    return data;
  }

  dispatchEvent() {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: this.productId })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  initialize() {
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
  }

  getSubElements() {
    const result = {};
    const subElements = this.element.querySelectorAll('[data-element]');
    for (const subElement of subElements) {
      result[subElement.dataset.element] = subElement;
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


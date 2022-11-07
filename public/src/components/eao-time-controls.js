import { msToString, stringToMs, formatDatetimeString, dashToCamelCase, camelToDashCase } from '../helpers/utilities.js';

export class EaoTimeControls extends HTMLElement {
  constructor() {
    super();

    this._shadow = this.attachShadow({ mode: 'open' });
  }

  get eao() {
    return this._eao;
  }
  set eao(eao) {
    if (eao !== this._eao) {
      this.removeEaoSequenceListeners();
      this._eao = eao;
      this.addEaoSequenceListeners()
      this.updateView();
    }
  }

  reset(e) {
    this.eao = e.detail.eao;
  }

  /**
   * Note: Am using aliases... Properties on this class refer to the watched `<eao-sequence>`
   * For example, `this.markInPosition` just returns `this.eaoSequence.markInPosition`
   */
  updateView = () => {
    if (!this.eao) {
      return;
    }
    this.markInInput.value = msToString(this.eao.markInPosition);
    this.markOutInput.value = msToString(this.eao.markOutPosition);
    this.headInput.value = msToString(this.eao.headPosition);
    this.insideInput.value = msToString(this.eao.markOutPosition - this.eao.markInPosition);
    this.outsideInput.value = msToString(this.eao.duration - (this.eao.markOutPosition - this.eao.markInPosition));
  }

  /* Handle changes to EAO duration, and new projects */
  onDataChanged = (e) => {
    if (e.detail.source === this.eao && ['sequence', 'duration'].includes(e.detail.name)) {
      this.updateView();
    }
  }

  addEaoSequenceListeners() {
    this.eao?.addEventListener('seek', this.updateView);
    this.eao?.addEventListener('dataChanged', this.onDataChanged);
    this.eao?.addEventListener('markInPositionChanged', this.updateView);
    this.eao?.addEventListener('markOutPositionChanged', this.updateView);
  }
  removeEaoSequenceListeners() {
    this.eao?.removeEventListener('seek', this.updateView);
    this.eao?.removeEventListener('dataChanged', this.onDataChanged);
    this.eao?.removeEventListener('markInPositionChanged', this.updateView);
    this.eao?.removeEventListener('markOutPositionChanged', this.updateView);
  }


  /* --- handlers for text inputs --- */
  onInputKeydown = (e) => {
    const input = e.target;
    const property = input.dataset.property;
    if (e.code === 'Enter' || e.code === 'Tab') {
      this[property] = stringToMs(input.value);
      input.blur();
      return;
    }
    if (e.code === 'Escape') {
      input.blur();
    }
  }

  onInputFocus = (e) => {
    const input = e.target;
    input.select();
  }

  onInputBlur = (e) => {
    this.updateView();
  }

  connectedCallback() {
    this._shadow.innerHTML = this.template;
    for (const input of this.timeControlInputs) {
      input.addEventListener('keydown', this.onInputKeydown)
      input.addEventListener('focus', this.onInputFocus);
      input.addEventListener('blur', this.onInputBlur);
    }

    this.updateView();
  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attribute, oldVal, newVal) {
    // console.log(`${attribute} changed from ${oldVal} to ${newVal}`);
    if (attribute.endsWith('-label')) {
      this[dashToCamelCase(attribute)] = newVal;
    }
  }

  get markInInput() {
    return this._shadow.querySelector('.mark-in-position input');
  }
  get markOutInput() {
    return this._shadow.querySelector('.mark-out-position input');
  }
  get headInput() {
    return this._shadow.querySelector('.head-position input');
  }
  get insideInput() {
    return this._shadow.querySelector('.inside input');
  }
  get outsideInput() {
    return this._shadow.querySelector('.outside input');
  }
  get timeControlInputs() {
    return [...this._shadow.querySelectorAll('.time-control input')];
  }


  get template() {
    return `
    <style>
      :host {
        font-family: sans-serif;
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
      }
      .time-control label,
      .time-control input {
        display: block;
      }
    </style>
    <div class="time-control mark-in-position" part="time-control mark-in-position">
      <label>MarkIn</label>
      <input class="time-control-input" data-property="markInPosition">
    </div>
    <div class="time-control mark-out-position" part="time-control mark-out-position">
      <label>MarkOut</label>
      <input class="time-control-input" data-property="markOutPosition">
    </div>
    <div class="time-control head-position" part="time-control head-position">
      <label>Head</label>
      <input class="time-control-input" data-property="headPosition">
    </div>
    <div class="time-control inside" part="time-control inside">
      <label>Inside</label>
      <input class="time-control-input" data-property="inside">
    </div>
    <div class="time-control outside" part="time-control outside">
      <label>Outside</label>
      <input class="time-control-input" data-property="outside">
    </div>
    `;
  }
}

customElements.define('eao-time-controls', EaoTimeControls);
export class EaoPlaceholder extends HTMLElement {
  constructor(eaoTextView, data, nextWordPosition) {
    super();

    this._eaoTextView = eaoTextView;
    this._data = data;

    // position of "next word"... used to prevent having "no word selected" (i.e., when headPosition is between words)
    this._nextWordPosition = nextWordPosition;

    this._shadow = this.attachShadow({ mode: 'open' });
  }

  get eaoTextView() {
    return this._eaoTextView;
  }

  set eaoTextView(eaoTextView) {
    if (eaoTextView === this.eaoTextView) {
      return;
    }
    this._eaoTextView = eaoTextView;
    this.updateView();
  }

  get data() {
    return this._data;
  }

  get value() {
    return this.data.value;
  }

  get position() {
    return this.data.position;
  }

  get duration() {
    return this.data.duration;
  }

  get nextWordPosition() {
    return this._nextWordPosition;
  }

  get eaoTextView() {
    return this._eaoTextView;
  }

  get isPunctuation() {
    return [',', '.', '!', '?', ';', ':'].includes(this.value);
  }

  get isAtHeadPosition() {
    return this.eaoTextView.headPosition >= this.position && this.eaoTextView.headPosition < (this.nextWordPosition || this.position + this.duration);
  }

  get isInSelection() {
    return this.eaoTextView.markInPosition <= this.position + 0.5 * this.duration && this.eaoTextView.markOutPosition > this.position + 0.8 * this.duration;
  }

  onHeadPositionChanged = (e) => {
    if (this.isAtHeadPosition) {
      this.classList.add('head-position');
      return;
    }
    if (this.classList.contains('head-position')) {
      this.classList.remove('head-position');
    }
  };
  
  onSelectionChanged = (e) => {
    if (this.isInSelection) {
      this.classList.add('selected');
      return;
    }
    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
    }
  }

  connectedCallback() {
    this._shadow.innerHTML = this.template;

    // style word at position
    this.eaoTextView.addEventListener('headPositionChanged', this.onHeadPositionChanged);

    // style words in selection
    this.eaoTextView.addEventListener('selectionChanged', this.onSelectionChanged);
  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    console.log(`${attribute} changed from ${oldValue} to ${newValue}`);
  }

  get mainView() {
    return this._shadow.querySelector('#mainView');
  }

  get template() {
    return `
      <style>
        :host {
          display: inline-block;
          width: 200px;
          padding: 2px 2px 2px 3px;
        }
        :host(:hover) {
          background: pink;
        }
        :host(.selected) {
          background: yellow;
        }
        :host(.head-position) {
          background: blue;
          color: white;
        }
      </style>
      <div class="placeholder">${this.value}</div>
    `;
  }
}

customElements.define('eao-placeholder', EaoPlaceholder);
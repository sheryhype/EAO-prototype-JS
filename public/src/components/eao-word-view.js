import { msToString } from '../helpers/utilities.js';

export class EaoWordView extends HTMLElement {
  constructor(eaoParagraph, word) {
    super();

    this._eaoParagraph = eaoParagraph;
    this._word = word;
    this._eaoParagraph;

    this._shadow = this.attachShadow({ mode: 'open' });
  }

  get eaoParagraph() {
    return this._eaoParagraph;
  }

  set eaoParagraph(eaoParagraph) {
    if (eaoParagraph === this.eaoParagraph) {
      return;
    }
    this._eaoParagraph = eaoParagraph;
    this.updateView();
  }

  get eaoTextView() {
    return this.eaoParagraph.eaoTextView;
  }

  get eaoParagraph() {
    return this._eaoParagraph;
  }

  get word() {
    return this._word;
  }

  get data() {
    return this._word.data;
  }

  get value() {
    return this._word.value;
  }

  get speaker() {
    return this._word.speaker;
  }

  get position() {
    return this._word.position;
  }
  get endPosition() {
    return this._word.position + this._word.duration;
  }
  get firstThirdPosition() {
    return this._word.position + 0.33 * this._word.duration;
  }
  get lastThirdPosition() {
    return this._word.position + 0.66 * this._word.duration;
  }

  get duration() {
    return this._word.duration;
  }

  get isPunctuation() {
    return [',', '.', '!', '?', ';', ':'].includes(this.value);
  }

  get nextWordView() {
    return this.eaoTextView?.wordViews[this.eaoTextView.wordViews.indexOf(this) + 1];
  }

  get previousWordView() {
    return this.eaoTextView?.wordViews[this.eaoTextView.wordViews.indexOf(this) - 1];
  }

  isAtPosition(position) {
    return position >= this.position && position < (this.nextWordView?.position || this.endPosition);
  }
  get isAtHeadPosition() {
    return this.eaoTextView?.headPosition >= this.position && this.eaoTextView.headPosition < (this.nextWordView?.position || this.endPosition);
  }
  get isInsideMarkInMarkOut() {
    return this.eaoTextView?.markInPosition <= this.lastThirdPosition && this.eaoTextView.markOutPosition >= this.firstThirdPosition;
  }
  
  get headPosition() {
    return this._headPosition;
  }
  set headPosition(headPosition) {
    if (headPosition === this.headPosition) {
      return;
    }
    this._headPosition = headPosition;
    this.headPosition ? this.classList.add('head-position') : this.classList.remove('head-position');
  }

  get isSelected() {
    return this._isSelected;
  }
  set isSelected(isSelected) {
    if (isSelected === this.isSelected) {
      return;
    }
    this._isSelected = isSelected;
    this.isSelected ? this.classList.add('selected') : this.classList.remove('selected');
  }

  remove() {
    if (!this.eaoParagraph) {
      return;
    }
    this.eaoParagraph.wordsDiv.removeChild(this);
  }

  connectedCallback() {
    this._shadow.innerHTML = this.template;

    /* --- show position, endPosition, and speaker.name in tooltip --- */
    this.setAttribute('title', `${msToString(this.position)}-${msToString(this.endPosition)} | ${this.speaker.name}`);
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
          padding: 2px 2px 2px 3px;
          user-select: none;
        }
        :host(:hover) {
          background: pink;
        }
        :host(.punctuation) {
          padding-left: 0;
        }
        :host(.selected) {
          background: yellow;
        }
        :host(.head-position) {
          background: blue;
          color: white;
        }
      </style>
      <div class="word${this.isPunctuation ? ' punctuation' : ''}">${this.value}</div>
    `;
  }
}

customElements.define('eao-word-view', EaoWordView);
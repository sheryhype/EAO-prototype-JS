import { EaoWordView } from './eao-word-view.js';

export class EaoParagraph extends HTMLElement {
  constructor(eaoTextView, words, speaker) {
    super();

    this._eaoTextView = eaoTextView;
    this._words = words;
    this._speaker = speaker;
    this._wordViews = [];

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
  }

  get words() {
    return this._words;
  }
  set words(words) {
    this._words = words;
  }

  get wordViews() {
    return this._wordViews;
  }
  set wordViews(wordViews) {
    this._wordViews = wordViews;
  }

  get speaker() {
    return this._speaker;
  }
  set speaker(speaker) {
    this._speaker = speaker;
  }

  remove() {
    while (this.wordViews.length) {
      const wordViewToRemove = this.wordViews.pop();
      wordViewToRemove.remove();
    }
    this.eaoTextView.mainView.removeChild(this);
  }

  updateView = () => {
    for (const word of this.words) {
      const wordView = new EaoWordView(this, word);
      this.wordViews.push(wordView);
      this.wordsDiv.appendChild(wordView);
    }
  }


  connectedCallback() {
    this._shadow.innerHTML = this.template;

    this.updateView();

  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    console.log(`${attribute} changed from ${oldValue} to ${newValue}`);
  }

  get speakerDiv() {
    return this._shadow.querySelector('#speakerDiv');
  }
  get wordsDiv() {
    return this._shadow.querySelector('#wordsDiv');
  }

  get template() {
    return `
      <style>
        :host {
          display: flex;
          flex-flow: row nowrap;
        }
        #wordsDiv {
          width: 600px;
        }
      </style>
      <div id="speakerDiv">
        <input id="renameSpeakerInput" value="${this.speaker.name}">
      </div>
      <div id="wordsDiv"></div>
    `;
  }
}

customElements.define('eao-paragraph', EaoParagraph);
import { msToString, stringToMs, formatDatetimeString, dashToCamelCase, camelToDashCase } from '../helpers/utilities.js';

export class EaoWordEditControls extends HTMLElement {
  constructor() {
    super();

    this._word;

    this._shadow = this.attachShadow({ mode: 'open' });
  }

  get word() {
    return this._word;
  }
  set word(word) {
    if (word === this.word) {
      return;
    }
    if (this.word) {
      this.removeTranscriptDataListeners()
    }
    this._word = word;
    this.addTranscriptDataListeners();
    this.updateView();
  }

  get speakers() {
    return this.word?.data.transcriptData.speakers;
  }
  get selectedSpeaker() {
    return this.speakers?.find(speaker => speaker.id === this.speakerSelect.value);
  }

  addTranscriptDataListeners() {
    this.word?.data.transcriptData.addEventListener('speakerUpdated', this.updateView);
    this.word?.data.transcriptData.addEventListener('wordDataUpdated', this.updateView);
  }
  
  removeTranscriptDataListeners() {
    this.word?.data.transcriptData.removeEventListener('speakerUpdated', this.updateView);
    this.word?.data.transcriptData.removeEventListener('wordDataUpdated', this.updateView);
  }

  updateView = () => {
    if (!this.word) {
      return;
    }
    this.valueInput.value = this.word?.value;
    this.updateSpeakerSelect();
  }

  /* Handle changes to EAO duration, and new projects */
  onDataChanged = (e) => {
    const { name, path, source, timelineChanged } = { ...e.detail };
    // console.log(name, path);
    if (e.detail.source === this.eao && ['sequence', 'duration'].includes(e.detail.name)) {
      this.updateView();
    }
  }

  /* --- manage <select> showing names of Speakers --- */
  updateSpeakerSelect = () => {
    if (!this.speakerSelect) {
      return;
    }
    while (this.speakerSelect.lastChild) { this.speakerSelect.removeChild(this.speakerSelect.lastChild) };
    if (!this.speakers?.length) {
      return;
    }
    for (const speaker of this.speakers) {
      this.speakerSelect.insertAdjacentHTML('beforeend', `<option value="${speaker.id}">${speaker.name}</option>`);
    }
    this.speakerSelect.value = this.word.speaker.id;
  }

  /* --- NOTICE: use word.data (WordData) for updating value and speaker... these are 'truths' about the transcript data --- */
  /* --- for 'non-truth' information that is particular to a specific word (i.e., a usage of a wordData), use word.customData --- */
  updateWord = (e) => {
    if (!this.word) {
      return;
    }
    const value = this.valueInput.value;
    const speaker = this.selectedSpeaker;
    if (value !== this.word.data.value) {
      this.word.data.value = value;
    }
    if (speaker !== this.word.data.speaker) {
      this.word.data.speaker = speaker;
    }
  }

  onInputKeydown = (e) => {
    // const input = e.target;
    // const property = input.dataset.property;
    // if (e.code === 'Enter' || e.code === 'Tab') {
    //   this.word[property] = stringToMs(input.value);
    //   input.blur();
    //   return;
    // }
    // if (e.code === 'Escape') {
    //   input.blur();
    // }
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

    for (const input of this.textInputs) {
      input.addEventListener('keydown', this.onInputKeydown)
      input.addEventListener('focus', this.onInputFocus);
      input.addEventListener('blur', this.onInputBlur);
    }

    this.updateButton.addEventListener('click', this.updateWord)
  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attribute, oldVal, newVal) {
    console.log(`${attribute} changed from ${oldVal} to ${newVal}`);
  }

  get valueInput() {
    return this._shadow.querySelector('#valueInput');
  }
  get speakerSelect() {
    return this._shadow.querySelector('#speakerSelect');
  }
  get updateButton() {
    return this._shadow.querySelector('#updateButton');
  }

  get textInputs() {
    return [...this._shadow.querySelectorAll('input[type="text"]')];
  }


  get template() {
    return `
    <style>
      :host {
        display: flex;
        flex-flow: row nowrap;
      }
      label:not(:first-of-type) {
        margin-left: 12px;
      }
      input,
      select {
        margin-left: 4px;
      }
    </style>
    <fieldset>
      <legend>Selected Word</legend>
      <label for="valueInput">Value</label><input id="valueInput" type="text">
      <label for="speakerSelect">Speaker</label><select id="speakerSelect"></select>
      <button id="updateButton">Update</button>
    </fieldset>
    `;
  }
}

customElements.define('eao-word-edit-controls', EaoWordEditControls);
import { msToString, stringToMs, formatDatetimeString, dashToCamelCase, camelToDashCase } from '../helpers/utilities.js';

export class EaoSpeakerEditControls extends HTMLElement {
  constructor() {
    super();

    this._speakers;
    this._shadow = this.attachShadow({ mode: 'open' });
    this.eao = document.querySelector(`#${this.getAttribute('eao')}`) || document.querySelector('eao-core');
  }
  
  get eao() {
    return this._eao;
  }
  set eao(eao) {
    if (eao !== this._eao) {
      this.eao?.removeEventListener('dataChanged', this.onDataChanged);
      this._eao = eao;
      this.eao.addEventListener('passagesUpdated', this.onPassagesUpdated);
      this.eao.addEventListener('dataChanged', this.onDataChanged);
    }
  }

  get speakers() {
    return this._speakers;
  }
  set speakers(speakers) {
    this._speakers = speakers;
    this.updateSpeakerSelect();
  }

  get selectedSpeaker() {
    return this._selectedSpeaker;
  }
  set selectedSpeaker(selectedSpeaker) {
    this._selectedSpeaker = selectedSpeaker;
    if (this.selectedSpeaker) {
      this.renameSpeakerInput.value = this.selectedSpeaker.name;
      /* --- this line will not work when loading stored projecdt with the current version... need to persist speaker.customData --- */
      if (this.selectedSpeaker.customData?.color) {
        this.speakerColorInput.value = this.selectedSpeaker.customData.color;
      }
    }
    this.dispatchEvent(new CustomEvent('selectedSpeakerChanged'));
  }

  onPassagesUpdated = (e) => {
    const { name, path, source, timelineChanged } = { ...e.detail };
    // console.log(name)
  }
  
  /* Handle changes to EAO speakers, and new projects */
  onDataChanged = (e) => {
    const { name, path, source, timelineChanged } = { ...e.detail };
    if (name === 'speakers') {
      this.updateSpeakerSelect();
    }
    if (name === 'transcriptData') {
      this.loadSpeakersFromTranscriptData();
    }
    if (name === 'name') {
      this.updateSpeakerSelect();
    }
  }
  
  loadSpeakersFromTranscriptData() {
    const speakers = [...new Set(...eao.media.map(medium => medium.transcriptData?.speakers))];
    this.speakers = speakers;
  }
  
  updateSpeakerSelect() {
    if (!this.speakerSelect || !this.speakers) {
      return;
    }
    while (this.speakerSelect.lastChild) { this.speakerSelect.removeChild(this.speakerSelect.lastChild) };
    for (const speaker of this.speakers) {
      this.speakerSelect.insertAdjacentHTML('beforeend', `<option value="${speaker.id}"${speaker === this.selectedSpeaker ? ' selected' : ''}>${speaker.name}</option>`);
    }
    if (!this.selectedSpeaker) {
      this.selectedSpeaker = this.speakers[0];
      return;
    }
  }

  onSpeakerSelectChanged = (e) => {
    this.selectedSpeaker = this.speakers.find(speaker => speaker.id === this.speakerSelect.value);
  }

  renameSpeaker = (e) => {
    this.selectedSpeaker.name = this.renameSpeakerInput.value;
  }

  setSpeakerColor = (e) => {
    this.selectedSpeaker.customData = { ...this.selectedSpeaker.customData, ...{ color: this.speakerColorInput.value } };
  }

  onInputKeydown = (e) => {
    // const input = e.target;
    // // const property = input.dataset.property;
    // if (['Enter', 'Tab', 'Escape'].includes(e.key)) {
    //   input.blur();
    // }
  }

  onInputFocus = (e) => {
    const input = e.target;
    input.select();
  }

  onInputBlur = (e) => {
    this.updateSpeakerSelect();
  }

  connectedCallback() {
    this._shadow.innerHTML = this.template;
    for (const input of this.textInputs) {
      input.addEventListener('keydown', this.onInputKeydown)
      input.addEventListener('focus', this.onInputFocus);
      input.addEventListener('blur', this.onInputBlur);
    }

    this.speakerSelect.addEventListener('change', this.onSpeakerSelectChanged);
    this.renameSpeakerButton.addEventListener('click', this.renameSpeaker);
    this.speakerColorButton.addEventListener('click', this.setSpeakerColor);

  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attribute, oldVal, newVal) {
    // console.log(`${attribute} changed from ${oldVal} to ${newVal}`);
    if (attribute.endsWith('-label')) {
      this[dashToCamelCase(attribute)] = newVal;
    }
  }

  get speakerSelect() {
    return this._shadow.querySelector('#speakerSelect');
  }
  get renameSpeakerInput() {
    return this._shadow.querySelector('#renameSpeakerInput');
  }
  get renameSpeakerButton() {
    return this._shadow.querySelector('#renameSpeakerButton');
  }
  get speakerColorInput() {
    return this._shadow.querySelector('#speakerColorInput');
  }
  get speakerColorButton() {
    return this._shadow.querySelector('#speakerColorButton');
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
        .control-group .margin-left-auto {
          margin-left: auto;
        }
        .control-group label,
        .control-group input {
          margin-left: 4px;
        }
      </style>
      <fieldset>
        <legend>Speakers</legend>
        <div class="control-group">
          <label for="speakerSelect">Speaker</label><select id="speakerSelect"></select>
        </div>
        <div class="control-group">
          <input id="renameSpeakerInput" type="text"><button id="renameSpeakerButton">Rename Speaker</button>
        </div>
        <div class="control-group">
          <input id="speakerColorInput" type="color" type="text"><button id="speakerColorButton">Set Color</button>
        </div>
      </fieldset>
    `;
  }
}

customElements.define('eao-speaker-edit-controls', EaoSpeakerEditControls);
import { msToString, stringToMs, formatDatetimeString, dashToCamelCase, camelToDashCase } from '../helpers/utilities.js';
export class EaoProjectControls extends HTMLElement {
  constructor() {
    super();

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
      this.eao.addEventListener('dataChanged', this.onDataChanged);
      this.eao.addEventListener('splitCutFinished', (e) => {
        console.log('splitCutFinished');
        console.log(e);
      });
    }
  }

  reset(e) {
    this.eao = e.detail.eao;
  }

  /* Handle changes to EAO duration, and new projects */
  onDataChanged = (e) => {
    // const name = e.detail.name;
    // console.log(name);
    // console.log(e.detail);
    if (name === 'title') {
      // console.log(this.eao.media[0].transcriptData?.speakers.map(speaker => speaker.name));
      this.updateView();
    }
    if (name === 'sequence') {
      // console.log(name);
      // console.log(this.eao.media[0].transcriptData?.speakers.map(speaker => speaker.name));
    }
  }


  onInputKeydown = (e) => {
    const input = e.target;
    const property = input.dataset.property;
    if (e.code === 'Enter' || e.code === 'Tab') {
      this.eao[property] = input.value;
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

  onProjectInputChange = (e) => {
    const file = this.loadProjectInput.files[0];
    const fileIsEao = file.name.split('.').pop() === 'eao';
    if (fileIsEao) {
      this.loadProject(file);
    }
    this.loadProjectInput.value = '';
  }

  loadProject(projectFile) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      this.eao.data = data;
    };
    reader.readAsText(projectFile);
  }

  saveProject = (e) => {
    this.textInputs.forEach(input => {
      this.eao[input.dataset.property] = input.value;
    });
    const data = new Blob([JSON.stringify(this.eao.data)], { type: "application/json" });
    const url = window.URL.createObjectURL(data);
    var link = document.createElement('a');
    link.setAttribute('download', `${this.eao.title || 'my default title'}.eao`);
    link.href = url;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
    this.projectTitleInput.addEventListener('blur', (e) => {
      this.eao.title = this.projectTitleInput.value;
    });
  }

  updateView = () => {
    if (!this.eao) {
      return;
    }
    this.projectTitleInput.value = this.eao.title;
  }

  connectedCallback() {
    this._shadow.innerHTML = this.template;

    for (const input of this.textInputs) {
      input.addEventListener('keydown', this.onInputKeydown)
      input.addEventListener('focus', this.onInputFocus);
      input.addEventListener('blur', this.onInputBlur);
    }
    
    this.loadProjectInput.addEventListener('change', this.onProjectInputChange);
    this.saveProjectButton.addEventListener('click', this.saveProject);
  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attribute, oldVal, newVal) {
    console.log(`${attribute} changed from ${oldVal} to ${newVal}`);
  }

  get loadProjectInput() {
    return this._shadow.querySelector('#loadProjectInput');
  }
  get saveProjectButton() {
    return this._shadow.querySelector('#saveProjectButton');
  }
  get projectTitleInput() {
    return this._shadow.querySelector('#projectTitleInput');
  }

  get textInputs() {
    return [...this._shadow.querySelectorAll('input[type="text"]')];
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
        .control-group {
          display: flex;
          flex-flow: row nowrap;
          justify-content: flex-start;
          align-items: center;
          margin-top: 4px;
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
        <legend>Project Controls</legend>
        <div id="controls">
          <div class="control-group">
            <label for="loadProjectInput">Load Project:</label><input id="loadProjectInput" type="file" accept=".eao">
          </div>
          <div class="control-group">
            <label for="projectTitleInput">Title:</label><input id="projectTitleInput" type="text" data-property="title" value="${this.eao?.title || ''}" placeholder="Project Title is empty">
          </div>
          <div class="control-group">
            <button class="margin-left-auto" id="saveProjectButton">Save Project</button>
          </div>
        </div>
      </fieldset>
    `;
  }
}

customElements.define('eao-project-controls', EaoProjectControls);
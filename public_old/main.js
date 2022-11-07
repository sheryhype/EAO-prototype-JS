import { EAO, DropModeEnum, RequestModeEnum } from './node_modules/@davidsystems/embedded-audio-object/eao-es6.min.js';
import { EaoTextView } from './src/components/eao-text-view.js';
import { EaoWordView } from './src/components/eao-word-view.js';
import { EaoParagraph } from './src/components/eao-paragraph.js';
import { loadTranscriptExample } from './src/helpers/load-transcript-example.js';
import { keyboardShortcuts } from './src/helpers/keyboard-shortcuts.js';
import { selectionHandlers } from './src/helpers/typical-selection-handlers.js';
import { typicalEaoSequenceSetup } from './src/helpers/typical-eao-sequence-setup.js';
import { customStyles } from './src/helpers/custom-styles.js';
import { EaoTimeControls } from './src/components/eao-time-controls.js';
import { EaoWordEditControls } from './src/components/eao-word-edit-controls.js';
import { EaoProjectControls } from './src/components/eao-project-controls.js';
import { EaoSpeakerEditControls } from './src/components/eao-speaker-edit-controls.js';

console.warn(`EAO version ${EAO.version}`);

// get <eao-core> (display: none)
const eao = document.querySelector('#mainEao');
window.eao = eao;
eao.addEventListener('passagesUpdated', (e) => console.log('passagesUpdated'));

// get <eao-sequence>
const eaoSeq = document.querySelector('#mainEaoSeq');
console.log(eaoSeq)
window.eaoSeq = eaoSeq;


// get <eao-text-view>
const eaoTextView = document.querySelector('eao-text-view');
window.eaoTextView = eaoTextView;

// get <eao-time-controls>
const eaoTimeControls = document.querySelector('eao-time-controls');
window.eaoTimeControls = eaoTimeControls;


// get <eao-word-edit-controls>
const eaoWordEditControls = document.querySelector('eao-word-edit-controls');
window.eaoWordEditControls = eaoWordEditControls;

// get <eao-speaker-edit-controls>
const eaoSpeakerEditControls = document.querySelector('eao-speaker-edit-controls');
window.eaoSpeakerEditControls = eaoSpeakerEditControls;

// do setup when <eao-core> is ready
eao.addEventListener('init', async (e) => {
  console.log(eaoSeq)
  eaoTextView.eaoSequence = eaoSeq;

  eaoTimeControls.eao = eaoSeq.eaoRef;

  /* --- some setup that is typical for common applications --- */
  keyboardShortcuts(eaoTextView.eaoSequence);
  customStyles(eaoTextView.eaoSequence);
  typicalEaoSequenceSetup(eaoTextView.eaoSequence);
  selectionHandlers(eaoTextView.eaoSequence);

  /* --- give eao some data -- <eao-text-view> will update */
  // await loadTranscriptExample(eaoTextView.eaoSequence);
});

eaoTextView.addEventListener('selectedWordViewChanged', (e) => {
  eaoWordEditControls.word = eaoTextView.selectedWordView;
});

/*-- MISC CONTROLS --- */
/* --- show/hide text layers in <eao-sequence> --- */
document.querySelector('#toggleTextLayers').addEventListener('click', () => {
  eaoSeq.showText = !eaoSeq.showText;
});
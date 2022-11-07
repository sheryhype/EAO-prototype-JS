import { EAO, DropModeEnum, RequestModeEnum } from './node_modules/@davidsystems/embedded-audio-object/eao-es6.min.js';

/* --- import components so CustomElements will be defined ---- */
import { EaoTextView } from './src/components/eao-text-view.js';
import { EaoWordView } from './src/components/eao-word-view.js';
import { EaoParagraph } from './src/components/eao-paragraph.js';
import { EaoTimeControls } from './src/components/eao-time-controls.js';
import { EaoWordEditControls } from './src/components/eao-word-edit-controls.js';
import { EaoProjectControls } from './src/components/eao-project-controls.js';
import { EaoSpeakerEditControls } from './src/components/eao-speaker-edit-controls.js';

/* --- some example scripts --- */
// import { loadTranscriptExample } from './src/helpers/load-transcript-example.js';
import { keyboardShortcuts } from './src/helpers/keyboard-shortcuts.js';
import { selectionHandlers } from './src/helpers/typical-selection-handlers.js';
import { toggleAutoScroll, toggleSnapEnabled, selectSelectionMode, selectDropMode, typicalEaoSequenceSetup } from './src/helpers/typical-eao-sequence-setup.js';
import { customStyles } from './src/helpers/custom-styles.js';

console.warn(`EAO version ${EAO.version}`);

// get <eao-core> (display: none)
const eao = document.querySelector('#mainEao');
window.eao = eao;
eao.addEventListener('passagesUpdated', (e) => console.log('passagesUpdated'));

// get <eao-sequence>
const eaoSequence = document.querySelector('#mainEaoSeq');
window.eaoSeq = eaoSequence;
const autoScrollCheckbox = document.querySelector('#autoScrollCheckbox');
toggleAutoScroll(eaoSequence, autoScrollCheckbox);
const snapToggleCheckbox = document.querySelector('#snapToggleCheckbox');
toggleSnapEnabled(eaoSequence, snapToggleCheckbox);
const selectionModeSelect = document.querySelector('#selectionModeSelect');
selectSelectionMode(eaoSequence, selectionModeSelect);
const dropModeSelect = document.querySelector('#dropModeSelect');
selectDropMode(eaoSequence, dropModeSelect);


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

/*-- MISC CONTROLS --- */
/* --- controls for managing <eao-sequence> behavior... --- */
/* --- ... used by typicalEaoSequenceSetup --- */
const showTextLayersCheckbox = document.querySelector('#showTextLayersCheckbox');
showTextLayersCheckbox.addEventListener('click', () => {
  eaoSequence.showText = !eaoSequence.showText;
  eaoSequence.focus();
});

function resetControls(e) {
  // console.log(e);
  [eaoTimeControls, eaoWordEditControls, eaoSpeakerEditControls].forEach(control => control.reset(e));
}
eaoTextView.addEventListener('sequenceChanged', resetControls);

// do setup when <eao-core> is ready
eao.addEventListener('init', async (e) => {
  eaoTextView.eaoSequence = eaoSequence;
  eaoTimeControls.eao = eaoSequence.eaoRef;

  /* --- some setup that is typical for common applications --- */
  keyboardShortcuts(eaoTextView.eaoSequence);
  customStyles(eaoTextView.eaoSequence);

  const autoAdjustMarkInMarkOutToWordBoundariesCheckbox = document.querySelector('#autoAdjustMarkInMarkOutToWordBoundariesCheckbox');
  typicalEaoSequenceSetup(eaoTextView.eaoSequence, autoAdjustMarkInMarkOutToWordBoundariesCheckbox);
  selectionHandlers(eaoTextView.eaoSequence);

  /* --- give eao some data -- <eao-text-view> will update */
  // await loadTranscriptExample(eaoTextView.eaoSequence);
});

eaoTextView.addEventListener('selectedWordViewChanged', (e) => {
  eaoWordEditControls.word = eaoTextView.selectedWordView;
});
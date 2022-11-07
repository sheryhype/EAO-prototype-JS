import { keyboardShortcuts } from './keyboard-shortcuts.js';


export async function typicalEaoSequenceSetup(eaoSequence) {

  // const json = await fetch('http://localhost:5500/helpers/custom-styles.json').then(result => result.json());
  // console.log(json);
  // console.log(eaoSequences);
  eaoSequence.addEventListener('mouseenter', (e) => eaoSequence.focus());
  eaoSequence.topRuler.addEventListener('click', (e) => {
    eao.headPosition = eaoSequence.workspace.mousePositionToMs(e.data.x);
  });
  eaoSequence.workspace.rootLayer.addEventListener('dblclick', (e) => {
    const clipLayer = e.composedPath().find(element => element.constructor.name === 'ClipLayer');
    console.log(clipLayer);
  });
  eaoSequence.dropMode = 'shuffle';
  eaoSequence.showPreview = true;
  eaoSequence.snapConfig.enabled = true;
  eaoSequence.snapConfig.snapToClips = true;
  eaoSequence.trimEnabled = true;
}
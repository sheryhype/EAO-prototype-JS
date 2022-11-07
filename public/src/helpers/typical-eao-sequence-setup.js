import { keyboardShortcuts } from './keyboard-shortcuts.js';

/**
 *
 * @param { EaoSequence } eaoSequence
 * @param { HTMLInputElement } autoScrollCheckbox <input type="checkbox">
 * @returns
 */
export function toggleAutoScroll(eaoSequence, autoScrollCheckbox) {
  if (!eaoSequence || !autoScrollCheckbox) {
    return;
  }
  autoScrollCheckbox.addEventListener('change', () => {
    eaoSequence.autoScroll = !eaoSequence.autoScroll;
    eaoSequence.focus();
  });
}

/**
 * `<input type="checkbox">` for toggling snapping behavior `<eao-sequence>.snapConfig`
 * @param { EaoSequence } eaoSequence
 * @param { HTMLInputElement } snapToggleCheckbox <input type="checkbox">
 * @returns
 */
export function toggleSnapEnabled(eaoSequence, snapToggleCheckbox, range, snapToClips, snapToClipsIgnoreEnd, snapToMarkers, snapToRangeAndHead) {
  if (!eaoSequence || !snapToggleCheckbox) {
    return;
  }
  /* --- set defaults... --- */
  eaoSequence.snapConfig = {
    enabled: true,
    range: 10,
    snapToClips: true,
    snapToClipsIgnoreEnd: true,
    snapToMarkers: true,
    snapToRangeAndHead: true
  };
  snapToggleCheckbox.checked = eaoSequence.snapConfig.enabled;
  /* --- this example only toggles general enable/disable... other properties can be managed elsewhere --- */
  snapToggleCheckbox.addEventListener('change', () => {
    eaoSequence.snapConfig.enabled = snapToggleCheckbox.checked;
    eaoSequence.focus();
  });
}

/**
 * `<select>` for managing `<eao-sequence>.selectionMode`
 * @param { EaoSequence } eaoSequence
 * @param { HTMLSelectElement } selectionModeSelect
 * @returns
 */
export function selectSelectionMode(eaoSequence, selectionModeSelect) {
  if (!eaoSequence || !selectionModeSelect) {
    return;
  }
  selectionModeSelect.addEventListener('change', () => {
    eaoSequence.selectionMode = selectionModeSelect.value;
    console.log(selectionModeSelect.value);
    eaoSequence.focus();
  });
  eaoSequence.addEventListener('seletionModeChanged', () => {
    selectionModeSelect.value = eaoSequence.selectionMode;
  });
}

/**
 * `<select>` for managing `<eao-sequence>.dropMode`
 * @param { EaoSequence } eaoSequence
 * @param { HTMLSelectElement } dropModeSelect
 * @returns
 */
export function selectDropMode(eaoSequence, dropModeSelect) {
  if (!eaoSequence || !dropModeSelect) {
    return;
  }
  dropModeSelect.addEventListener('change', () => {
    eaoSequence.dropMode = dropModeSelect.value;
  });
  eaoSequence.addEventListener('dropModeChanged', () => {
    dropModeSelect.value = eaoSequence.dropMode;
  });
}

export async function typicalEaoSequenceSetup(eaoSequence) {
  eaoSequence.addEventListener('mouseenter', (e) => eaoSequence.focus());
  eaoSequence.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log('contextmenu prevented');
  });
  eaoSequence.topRuler.addEventListener('click', (e) => {
    eao.headPosition = eaoSequence.workspace.mousePositionToMs(e.detail.x);
  });
  // eaoSequence.workspace.rootLayer.addEventListener('mousedown', (e) => {
  //   const target = e.composedPath();
  //   console.log(e);
  //   if (e.detail.originalEvent.buttons === 1) {
  //     eao.markInPosition = eaoSequence.workspace.mousePositionToMs(e.detail.x);
  //   }
  //   if (e.detail.originalEvent.buttons === 2) {
  //     eao.markOutPosition = eaoSequence.workspace.mousePositionToMs(e.detail.x);
  //   }
  //   if (e.detail.originalEvent.buttons === 4) {
  //     eao.headPosition = eaoSequence.workspace.mousePositionToMs(e.detail.x);
  //   }
  // });
  eaoSequence.topRuler.addEventListener('mousemove', (e) => {
    const button = e.detail.originalEvent.buttons;
    // eao.headPosition = eaoSequence.workspace.mousePositionToMs(e.detail.x);
  });
  eaoSequence.workspace.rootLayer.addEventListener('dblclick', (e) => {
    const clipLayer = e.composedPath().find(element => element.constructor.name === 'ClipLayer');
    console.log(clipLayer);
  });

  /* --- some "standard defaults" -- most (all?) can be applied by using attributes on <eao-sequence>... dealer's choice --- */
  eaoSequence.showRuler = true;
  eaoSequence.showScrollbar = true;
  eaoSequence.autoScroll = true;

  eaoSequence.useAutoHeight = true;
  eaoSequence.syncSoundheadMode = true;

  /* --- standard eaoSequence.workspaceConfig --- */
  eaoSequence.waveformConfig.trimEnabled = true;
  eaoSequence.waveformConfig.fadeEnable = true;
  eaoSequence.waveformConfig.draggable = true;

  /* --- my preferred eaoSequence.workspaceConfig --- */
  eaoSequence.wheelConfig.scrollSpeed = 1.7;
  eaoSequence.wheelConfig.zoomFactor = 1.1;

  /* --- needed for showing preview of results during drag-drop in dropMode: shuffle --- */
  eaoSequence.showPreview = true;
  eaoSequence.dropMode = 'shuffle';
  eaoSequence.snapConfig = {
    enabled: true,
    range: 10,
    snapToClips: true,
    snapToClipsIgnoreEnd: true,
    snapToMarkers: true,
    snapToRangeAndHead: true
  };

  /* --- handle mouse events in the <eao-sequence>, workspace, root layer --- */
  eaoSequence.addEventListener('mousedown', onEaoSequenceMouseUp);
  eaoSequence.addEventListener('mouseup', onEaoSequenceMouseUp);

  function onEaoSequenceMouseUp(e) {
    if (autoAdjustMarkInMarkOutToWordBoundariesCheckbox?.checked) {
      const words = eaoSequence.eaoRef.transcript.words;
      const markInWord = words.find((word, i) => eaoSequence.markInPosition >= word.position && eaoSequence.markInPosition < eaoSequence.markInPosition);
      const markOutWord = words.find((word, i) => eaoSequence.markOutPosition >= word.position && (words[i + 1] ? eaoSequence.markOutPosition < words[i + 1].position : true));
      if (!markInWord || !markOutWord) {
        return;
      }
      eaoSequence.markInPosition = markInWord.position;
      eaoSequence.markOutPosition = markOutWord.position + markOutWord.duration;
      console.log(markInWord, markOutWord);
    }
  }

  // function wordIntersectsPosition(word, position) {
  //   return position >= word.position && position < word.position + word.duration
  // }
}
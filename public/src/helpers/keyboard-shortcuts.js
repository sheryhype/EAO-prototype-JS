import { getNextPosition, getPreviousPosition } from './utilities.js';

export function keyboardShortcuts(eaoSequence) {
  
  const inputInPath = (e) => {
    return e.path.find(element => element.tagName === 'INPUT');
  };
  
  const soundheadInView = () => {
    return eao.headPosition > eaoSequence.displayOffset && eao.headPosition < eaoSequence.displayOffset + eaoSequence.displayDuration;
  };
  
  const goToSoundhead = () => {
    eaoSequence.zoom(eaoSequence.displayDuration, eao.headPosition);
  };
  
  const eao = eaoSequence.eaoRef;
  eaoSequence.addEventListener('keydown', (e) => {
    if (inputInPath(e)) {
      return;
    }
    // console.log({key: e.key, shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altkey, meta: e.metaKey});
    if (e.code === 'Digit1' && e.shiftKey) {
      e.preventDefault();
      eaoSequence.dropMode = 'shuffle';
      document.querySelector('#dropModeSelect').value = eaoSequence.dropMode;
    }
    if (e.code === 'Digit2' && e.shiftKey) {
      e.preventDefault();
      eaoSequence.dropMode = 'overwrite';
      document.querySelector('#dropModeSelect').value = eaoSequence.dropMode;
    }
    if (e.code === 'KeyZ') {
      e.preventDefault();
      e.shiftKey ? eao.undoRedoManager.redo() : eao.undoRedoManager.undo();
    }
    if (e.key === ' ') {
      e.preventDefault();
      // console.log({isPlaying: eao.isPlaying, shiftKey: e.shiftKey});
      if (e.shiftKey) {
        if (eao.playing) eao.pause();
        let regions = [{ start: eao.markInPosition, end: eao.markOutPosition }];
        eao.play({ regions, returnToStart: false });
      } else {
        eao.playing ? eao.pause() : eao.play();
      }
    }
    if (e.code === 'Home' || e.code === 'Enter') {
      e.preventDefault();
      eao.headPosition = 0;
    }
    if (e.code === 'End') {
      e.preventDefault();
      eao.headPosition = eao.duration;
    }
    if (e.code === 'Comma') {
      e.preventDefault();
      eao.headPosition = getPreviousPosition(eao);
    }
    if (e.code === 'Period') {
      e.preventDefault();
      eao.headPosition = getNextPosition(eao);
    }
    if (e.key === 'a') {
      eao.headPosition = eao.markInPosition;
    }
    if (e.key === 's') {
      eao.markInPosition = eao.headPosition;
    }
    if (e.key === 'd') {
      eao.markOutPosition = eao.headPosition;
    }
    if (e.key === 'f') {
      eao.headPosition = eao.markOutPosition;
    }
    if (e.code === 'KeyR' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const currentFocus = eaoSequence.displayOffset + 0.5 * eaoSequence.displayDuration;
      eaoSequence.zoomOut(1.5, currentFocus);
    }
    if (e.code === 'KeyT' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const currentFocus = eaoSequence.displayOffset + 0.5 * eaoSequence.displayDuration;
      eaoSequence.zoomIn(1.5, currentFocus);
    }
    if (e.code === 'Backslash') {
      if (e.shiftKey) {
        goToSoundhead();
        return;
      }
      const autoScrollButton = eao.$.contextMenuComponent.shadowRoot.querySelector('.auto-scroll');
      if (autoScrollButton) {
        autoScrollButton.click();
      }
    };
    if (e.key === 'w') {
      eaoSequence.zoom(eaoSequence.displayDuration, eao.headPosition);
    }
    if (e.key === 'W') {
      const newDisplayDuration = 1.1 * (eao.markOutPosition - eao.markInPosition);
      const newFocus = 0.5 * (eao.markInPosition + eao.markOutPosition);
      eaoSequence.zoom(newDisplayDuration, newFocus);
    }
    if (e.code === 'KeyP') {
      e.preventDefault();
      if (e.altKey) {
        if (eao.playing) eao.pause();
        const regions = [
          { start: 0.25 * eao.media[0].mainFile.duration, end: Math.min(0.5 * eao.media[0].mainFile.duration, 0.25 * eao.media[0].mainFile.duration + 4200) },
          { start: 0, end: Math.min(0.25 * eao.media[0].mainFile.duration, 4200) },
          { start: 0.5 * eao.media[0].mainFile.duration, end: Math.min(0.75 * eao.media[0].mainFile.duration, 0.5 * eao.media[0].mainFile.duration + 4200) }
        ];
        eao.play({ regions, returnToStart: false });
      } else {
        const lastSelected = eaoSequence.selectedObjects.lastSelectedObject;
        if (!lastSelected || !['Track', 'TrackElement', 'Placeholder'].includes(lastSelected.constructor.name)) {
          alert('No target Track defined... not sure where to put the Placeholder');
          return;
        }
        const track = lastSelected.constructor.name === 'Track' ? lastSelected : lastSelected.track;
        track.createPlaceholder();
      }
    }
    if (e.code === 'KeyB') {
      e.preventDefault();
      // const cursorMarker = eaoSequence.workspace.cursorMarker;
      if (e.shiftKey) {
        eao.splitAtRange();
      } else {
        eao.splitAtPosition();
      }
    }
    if (e.key === 'x') {
      eao.cutRangeAndMove(eao.markInPosition, eao.markOutPosition, eao.sequence.tracks);
    }
    if (e.key === 'X') {
      eao.cutOutsideAndMove();
    }
    if (e.code === 'KeyC') {
      if (e.shiftKey && e.metaKey) {
        return;
      }
      e.preventDefault();
      const tracks = eao.selectedObjects.tracks.length > 0 ? eao.selectedObjects.tracks : eao.sequence.tracks;
      console.log(tracks);
      eao.copyRange(eao.markInPosition, eao.markOutPosition, tracks);
    }
    if (e.key === 'v') {
      e.preventDefault();
      eao.insert(eao.clipboard.lastItem, eao.headPosition, eao.sequence.tracks, eaoSequence.dropMode);
    }
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      // const currentPosition = eao.headPosition;
      eao.headPosition -= e.shiftKey ? eao.$.sequenceComponent.displayDuration / 10 : 1000;
      // console.log(currentPosition, eao.headPosition);
    }
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      // const currentPosition = eao.headPosition;
      eao.headPosition += e.shiftKey ? eao.$.sequenceComponent.displayDuration / 10 : 1000;
      // console.log(currentPosition, eao.headPosition);
    }
    if (e.code === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      const selectedTrackElements = eaoSequence.selectedObjects.trackElements;
      for (const trackElement of selectedTrackElements) {
        const currentTrackIndex = eao.sequence.tracks.findIndex(track => track === trackElement.track);
        const trackAbove = eao.sequence.tracks[currentTrackIndex - 1];
        if (currentTrackIndex !== -1 && trackAbove) {
          trackElement.track = trackAbove;
        }
        eaoSequence.selectedObjects.select(trackElement);
      }
    }
    if (e.code === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      const selectedTrackElements = eaoSequence.selectedObjects.trackElements;
      for (const trackElement of selectedTrackElements) {
        const currentTrackIndex = eao.sequence.tracks.findIndex(track => track === trackElement.track);
        const trackBelow = eao.sequence.tracks[currentTrackIndex + 1] || eao.sequence.createTrack();
        if (currentTrackIndex !== -1 && trackBelow) {
          trackElement.track = trackBelow;
        }
        eaoSequence.selectedObjects.select(trackElement);
      }
    }
    if (e.code === 'KeyM') {
      e.preventDefault();
      if (e.shiftKey) {
        const lastSelected = eao.lastSelectedObject;
        if (lastSelected?.constructor.name === 'TrackElement') {
          lastSelected.clip.createMarker(eao.headPosition - lastSelected.position, 'new-marker', 'default');
          return;
        }
        alert('Last selected object is not a TrackElement... I don\'t know what you want me to do!');
      }
      eao.sequence.createMarker(eao.headPosition, 'new-marker', 'default');
    }

    if (e.code === 'Backspace') {
      e.preventDefault();
      const selectedObjects = eaoSequence.selectedObjects;
      if (e.shiftKey) {
        const tracks = selectedObjects.tracks.length > 0 ? selectedObjects.tracks : eao.sequence.tracks;
        eao.cutInside(eao.markInPosition, eao.markOutPosition, tracks);
        return;
      }
      for (const trackElement of selectedObjects.trackElements) {
        trackElement.track.removeTrackElement(trackElement.id);
      }
      for (const placeholder of selectedObjects.placeholders) {
        placeholder.track.removePlaceholder(placeholder.id);
      }
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (e.shiftKey) {
        [...eaoSequence.shadowRoot.querySelectorAll('eao-marker.start, eao-marker.end'), document.querySelector('#markInOutHighlight')].forEach(marker => marker.style.display = marker.style.display === 'none' ? 'block' : 'none');
        return;
      }
      eaoSequence.selectedObjects.clear();
    }
  });
}
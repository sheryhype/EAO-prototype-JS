export function selectionHandlers(eaoSequence) {
  const eao = eaoSequence.eaoRef;

  function setMarkersHandler(args) {
    const clipLayer = args.data.path.find(layer => layer.constructor.name === 'ClipLayer');
    
    // prevent dbl click conflict with clicked word-layer logic
    const wordLayer = args.data.path.find(layer => layer.constructor.name === 'WordLayer');
    if(clipLayer && ! wordLayer) {
      // Example: Set markIn/markOut on selecting the same trackElement again
      eao.markInPosition = clipLayer.model.position;
      eao.markOutPosition = clipLayer.model.endPosition;
    }
  }
  
  eaoSequence.workspace.rootLayer.addEventListener('dblclick', setMarkersHandler);
  eaoSequence.workspace.rootLayer.addEventListener('dbltap', setMarkersHandler);

  eaoSequence.addEventListener('click', (e) => {
    const target = e.composedPath()[0];
    // console.log(e.buttons, e.button, target);
    if(target.tagName === 'EAO-MARKER' && target.model) {
      if(e.shiftKey) {
        if(eaoSequence.selectedObjects.contains(target.model)) {
          eaoSequence.selectedObjects.deselect(target.model);
        } else {
          eaoSequence.selectedObjects.select(target.model);
        }
      } else {
        eaoSequence.selectedObjects.clear();
        eaoSequence.selectedObjects.select(target.model);
      }
    }
  });
}
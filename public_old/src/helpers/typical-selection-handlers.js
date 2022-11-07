export function selectionHandlers(sequenceComponent) {
  const eao = sequenceComponent.eaoRef;
  function setMarkersHandler(args) {
    let clipLayer = args.data.path.find(layer => layer.constructor.name === 'ClipLayer');
    // prevent dbl click conflict with clicked word-layer logic
    let wordLayer = args.data.path.find(layer => layer.constructor.name === 'WordLayer');
    if(clipLayer && ! wordLayer) {
      // Example: Set markIn/markOut on selecting the same trackElement again
      eao.markInPosition = clipLayer.model.position;
      eao.markOutPosition = clipLayer.model.endPosition;
    }
  }
  
  sequenceComponent.workspace.rootLayer.addEventListener('dblclick', setMarkersHandler);
  sequenceComponent.workspace.rootLayer.addEventListener('dbltap', setMarkersHandler);

  sequenceComponent.addEventListener('click', (e) => {
    let target = e.composedPath()[0];
    if(target.tagName === 'EAO-MARKER' && target.model) {
      if(e.shiftKey) {
        if(sequenceComponent.selectedObjects.contains(target.model)) {
          sequenceComponent.selectedObjects.deselect(target.model);
        } else {
          sequenceComponent.selectedObjects.select(target.model);
        }
      } else {
        sequenceComponent.selectedObjects.clear();
        sequenceComponent.selectedObjects.select(target.model);
      }
    }
  });
}
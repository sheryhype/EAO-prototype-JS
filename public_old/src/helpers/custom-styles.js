export function customStyles(eaoSequence) {
  eaoSeq.shoext = true;
  const customStyles = {
    'clip-layer': {
      borderColor: null,
      borderWidth: 0,
      backgroundColor: null
    },
    'clip-layer-hover': {
      borderColor: '#4c7fff',
      borderWidth: 1,
      backgroundColor: '#e5f3ffaa'
    },
    'clip-layer-focus': {
      borderWidth: 1,
      borderColor: 'red'
    },
    'clip-layer-selected': {
      backgroundColor: '#cce8ffaa'
    },
    'track-layer': {
      backgroundColor: 'transparent',
      textHeight: 32,
      waveformHeight: 100,
      showText: true,
    },
    'track-layer-selected': {
      backgroundColor: '#fff7d6'
    },
    'placeholder-layer': {
      backgroundColor: '#cce8ffaa'
    },
    'placeholder-layer-selected': {
      backgroundColor: '#d2eafa'
    },
    'marquee-selection-layer': {
      backgroundColor: '#aaaaaaaa', // set transparent to hide
      lineColor: 'black', // selection rectangle color
      lineWidth: 1, // selection rectangle line width
      lineDash: [2, 2] // selection rectangle line dashes, set null for no dashes
    },
    'range-selection-layer': {
      color: '#dcf3fd',
      trackElementBackgroundColor: '#dcf3fd',
      lineColor: '#66c6f1',
      lineWidth: 3
    },
    'range-drag-handle': {
      text: '||||',
      font: 'bold 10px Arial, sans-serif',
      backgroundColor: '#dcf3fd',
      color: '#000',
      visible: false
    },
    'range-drag-handle-top': {
      topTextMargin: 3,
      visible: true
    },
    'range-drag-handle-bottom': {
      bottomTextMargin: 3,
      visible: true
    },
    'text-layer': {
      font: '16px sans-serif'
    }
  };

  for (const style in customStyles) {
    eaoSequence.styleObjects.delete(style);
    eaoSequence.styleObjects.set(style, customStyles[style]);
  }
}
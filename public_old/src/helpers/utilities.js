export const dpeToken = (userName = DEFAULT_USER, password = DEFAULT_PASSWORD, computerName = DEFAULT_COMPUTERNAME) => {
  const date = new Date;
  const dateString = date.getFullYear() + date.getMonth().toString().padStart(2, "0") + date.getDay().toString().padStart(2, "0") + date.getHours().toString().padStart(2, "0") + date.getMinutes().toString().padStart(2, "0") + date.getSeconds().toString().padStart(2, "0") + date.getMilliseconds().toString().padStart(3, "0");
  const token = btoa(dateString + ":" + computerName + ":" + userName + ":" + password);
  return token;
};

// export const formatDatetimeString = (datetimeString, returnDate = true, returnTime = true) => {
//   const parts = datetimeString.split('T');
//   const datePart = parts[0];
//   const timePart = parts[1];
//   return `${returnDate ? datePart : ''} ${returnTime ? timePart : ''}`;
// }

export const formatDatetimeString = (datetimeString, returnDate = true, returnTime = true) => {
  const d = new Date(datetimeString);
  const year = `${d.getFullYear()}`.padStart(2, '0');
  const month = `${d.getMonth()}`.padStart(2, '0');
  const date = `${d.getDate()}`.padStart(2, '0');
  const dateString = `${year}-${month}-${date}`;
  const hours = `${d.getHours()}`.padStart(2, '0');
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  const seconds = `${d.getSeconds()}`.padStart(2, '0');
  const milliseconds = `${d.getMilliseconds()}`.padStart(3, '0');
  const timeString = `${hours}:${minutes}:${seconds}.${milliseconds}`;
  return `${returnDate ? dateString : ''} ${returnTime ? timeString : ''}`.trim();
}

export const msToString = (ms, showHours = false, showMilliseconds = true) => {
  const hours = showHours ? `${Math.floor(ms / (1000 * 60 * 60))}`.padStart(2, '0') + ':' : '';
  const minutes = `${Math.floor(ms / (1000 * 60)) % 60}`.padStart(2, '0');
  const seconds = `${Math.floor(ms / 1000) % 60}`.padStart(2, '0');
  const milliseconds = showMilliseconds ? '.' + `${Math.floor(ms) % 1000}`.padStart(3, '0') : '';
  return `${hours}${minutes}:${seconds}${milliseconds}`;
};

export const stringToMs = (timecodeString) => {
  const periodParts = timecodeString.split('.');
  const msString = periodParts.length > 1 ? periodParts[periodParts.length - 1] : '000';
  const colonParts = periodParts[0].split(':');
  let milliseconds = Number(msString.padEnd(3, '0'));
  for (let i = colonParts.length - 1; i >= 0; i--) {
    const partAsNumber = Number(colonParts[i]);
    if (partAsNumber > 59 || partAsNumber < 0) {
      throw ('timecode string is invalid... somepart is greater than 59');
    }
    milliseconds += (60 ** (colonParts.length - 1 - i)) * 1000 * partAsNumber;
  }
  return milliseconds;
}

export const newGuid = () => {
  var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return guid;
};

export const newTrackNumber = (eao) => {
  if (eao.sequence.tracks.length < 1) {
    return 'Track_01';
  } else {
    let lastTrk = eao.sequence.tracks[eao.sequence.tracks.length - 1].trackName;
    let trkNum = parseInt(lastTrk.split('_')[1]) + 1;
    if (parseInt(trkNum) < 10) trkNum = `0${trkNum}`;
    return `Track_${trkNum}`;
  }
};

export const newMarkerLabel = (eao) => {
  let numMarkers = eao.sequence.markers.length;
  let label = numMarkers < 10 ? '0' + numMarkers : numMarkers;
  return label;
};

export const getNavigationPositions = (eao) => {
  const navigationPositions = [0, eao.markInPosition, eao.markOutPosition, eao.headPosition, eao.duration];
  for (const trackObject of eao.sequence.getAllTrackElementsAndPlaceholders()) {
    navigationPositions.push(trackObject.position);
    navigationPositions.push(trackObject.endPosition);
  }
  for (const marker of eao.sequence.markers) {
    navigationPositions.push(marker.position);
  }
  navigationPositions.sort((a, b) => { return a > b ? 1 : a < b ? -1 : 0; });
  return navigationPositions;
};

export const getNextPosition = (eao) => {
  const positions = getNavigationPositions(eao);
  return positions.find(position => position > eao.headPosition) || positions[positions.length - 1];
};

export const getPreviousPosition = (eao) => {
  const positions = getNavigationPositions(eao);
  const previousPositions = positions.filter(position => position < eao.headPosition);
  return previousPositions.length > 1 ? previousPositions[previousPositions.length - 1] : 0;
};

export const loadEntryToEaoByPartialContent = async (dpeRootAddress, dpeToken, entry, eao) => {
  eao.newProject();
  eao.sequence.createTrack();
  eao.pending = true;
  const medium = eao.createMedium();
  const audioFile = medium.getFile('Linear');
  audioFile.fileName = `${dpeRootAddress}/Media.ashx?tableId=${entry.table}&entryId=${entry.number}&dpe-auth=${dpeToken}&main=true`;
  const peakFile = medium.getFile('Peakfile');
  peakFile.fileName = `${dpeRootAddress}/Waveform.ashx?tableId=${entry.table}&entryId=${entry.number}&dpe-auth=${dpeToken}`;

  const waveformData = await medium.readWaveformData();
  const duration = waveformData.duration;
  const sampleRate = waveformData.sampleRate;
  const sampleCount = (sampleRate / 1000) * waveformData.channelCount * duration;
  [audioFile, peakFile].forEach(file => {
    file.duration = duration;
    file.sampleRate = sampleRate;
    file.sampleCount = sampleCount;
  });
  eao.undoRedoManager.createTransaction(() => {
    const clip = medium.createClip('init', 0, medium.mainFile.duration);
    const trackElement = eao.sequence.tracks[0].createTrackElement(clip, eao.headPosition);
  }, 'Host:ImportEntryByPartialConent');

  eao.pending = false;
}

export const dashToCamelCase = (dashCaseString) => {
  const caseMap = {};
  return caseMap[dashCaseString] || (
    caseMap[dashCaseString] = dashCaseString.indexOf('-') < 0 ? dashCaseString : dashCaseString.replace(/-[a-z]/g,
      (m) => m[1].toUpperCase()
    )
  );
}

export const camelToDashCase = (camelCaseString) => {
  const caseMap = {};
  return caseMap[camelCaseString] || (
    caseMap[camelCaseString] = camelCaseString.replace(/([A-Z])/g, '-$1').toLowerCase()
  );
}
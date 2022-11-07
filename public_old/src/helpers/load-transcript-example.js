const tableId = 'NewMedia\\Production';
const entryId = 73;
// const entryId = 72;
const dpeServiceRoot = `https://newmedia.davidsystems.com/DpeWebApplication`;
const dpeToken = `MjAyMjA3MjgxMjQyMjA4NDE6U0hBLU1CQTpzaGE6OlNpZ25hdHVyZTpaWGVpRXRFcEdRTlhrUk5Cb3Npa3ZnbVI2TVVubFM0b3BZdDJtMHVXaWNnNHd0YXRxY3huWlVwY21jVGlYd281TXV4WVVDQm1qSzNRNFk1ZkgwNjQrZnJPRWhwbEFwLzRsSjA1STJ5NytqMFlQd3FjMnExMk1iRFI0bkVmeldJVEQ0QUZ6U1JYQ2pGTjBYajlKMStzM3J4eXRzc0h4T1Z0bThWeWRuQ3dIT0NnQmFsTWk0QnBaNkxIUmpOZlVYUlovT1c4MVNOMXZWWXAxeUs3YzZ0aXdyajF5ejkvZ0pFNUZIMEY0bDlYeWVtdHNQNVBvQXdGTUhwcXVJd3o1ZE1SbE4zNU9mYmpnOU9OcVAyS1NzVnRSQVlVdGdsMThISzlaTUdDZGR5RFNnK2x3Vno3SGZoYVFyT3hIOHAwUzFPaVhNSWp4S3BVZnZsVG9UUXlBdm1TdlE9PQ==`;

export async function loadTranscriptExample(eaoSequence) {
  const eao = eaoSequence.eaoRef;
  eao.newProject();

  const track = eao.sequence.createTrack('track-00');
  const medium = eao.createMedium();
  
  const linear = medium.getFile('Linear');
  linear.fileName = `${dpeServiceRoot}/Media.ashx?tableId=${tableId}&entryId=${entryId}&dpe-auth=${dpeToken}&main=true`;
  const peakfile = medium.getFile('Peakfile');
  peakfile.fileName = `${dpeServiceRoot}/Waveform.ashx?tableId=${tableId}&entryId=${entryId}&dpe-auth=${dpeToken}`;
  
  const waveformData = await medium.readWaveformData();
  const duration = waveformData.duration;
  const sampleRate = waveformData.sampleRate;
  const sampleCount = Math.round((sampleRate / 1000) * waveformData.channelCount * duration);
  [linear, peakfile].forEach(file => {
    file.duration = duration;
    file.sampleRate = sampleRate;
    file.sampleCount = sampleCount;
  });
  
  const s2tUrl = `${dpeServiceRoot}/DownloadMedium.ashx?tableId=${tableId}&entryId=${entryId}&mediumType=Data.SpeechToText&dpe-auth=${dpeToken}`;
  const transcriptData = await eao.importTranscriptPath(s2tUrl, medium.mediumId, {});
  const transcript = medium.getFile('Transcript');
  transcript.fileName = s2tUrl;
  
  const clip = medium.createClip('clip-00', 0, linear.duration);
  const trackElement = track.createTrackElement(clip, eao.headPosition);
  trackElement.clip.medium.addEventListener('transcriptDataChanged', () => {
    console.log('medium transcriptDataChanged');
  });
  trackElement.track.hasTranscript = trackElement.trackElementTranscript.words > 0;
  eaoSequence.zoomFitDuration();
}
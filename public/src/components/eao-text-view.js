import { EaoParagraph } from './eao-paragraph.js';
import { EaoWordView } from './eao-word-view.js';
import { msToString } from '../helpers/utilities.js';

export class EaoTextView extends HTMLElement {
  constructor() {
    super();

    this._eaoSequence;

    this._wordViews = [];
    this._paragraphViews = [];
    this._selectedWordView;
    this._selectedWordViews = [];
    this._wordAtHeadPosition;
    /* --- for managing mouse behaviors --- */
    this.mouseData = {
      shouldClick: true,
      wordViewAtMouseDown: undefined,
      wordViewUnderMouse: undefined
    };
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  get eaoSequence() {
    return this._eaoSequence;
  }
  set eaoSequence(eaoSequence) {
    if (eaoSequence === this.eaoSequence) {
      return;
    }
    if (this._eaoSequence) {
      this.removeEventListeners(this.eaoSequence);
    }
    if (eaoSequence) {
      this._eaoSequence = eaoSequence;
      this.eaoSequence.showText = true;
      this.addEaoSequenceEventListeners(this.eaoSequence);

    }
  }

  get eao() {
    return this.eaoSequence?.eaoRef;
  }

  get headPosition() {
    return this.eaoSequence.headPosition;
  }
  set headPosition(position) {
    if (position === this.headPosition) {
      return;
    }
    this.eaoSequence.headPosition = position;
    if (!this.eao.playing && !this.eao.recording) {
      /* --- if EAO is not playing or recording, update the view so that the new head position is centered --- */
      this.eaoSequence.zoom(this.eaoSequence.displayDuration, this.headPosition);
    }
  }

  get markInPosition() {
    return this.eaoSequence.markInPosition;
  }
  set markInPosition(position) {
    if (position === this.markInPosition) {
      return;
    }
    this.eaoSequence.markInPosition = position;
  }

  get markOutPosition() {
    return this.eaoSequence.markOutPosition;
  }
  set markOutPosition(position) {
    if (position === this.markOutPosition) {
      return;
    }
    this.eaoSequence.markOutPosition = position;
  }

  get transcript() {
    return this.eao.transcript;
  }
  get transcriptPlain() {
    return this.transcript.words.map(word => word.value).join(' ');
  }

  get speakers() {
    return [...new Set(this.transcript.blocks.map(block => block.speaker))];
  }

  get wordViews() {
    return this.paragraphViews.reduce((acc, curr) => { return acc = [...acc, ...curr.wordViews] }, []);
  }

  get paragraphViews() {
    return this._paragraphViews;
  }
  set paragraphViews(paragraphViews) {
    this._paragraphViews = paragraphViews;
  }

  get selectedWordView() {
    return this._selectedWordView;
  }
  set selectedWordView(wordView) {
    if (wordView === this.selectedWordView) {
      return;
    }
    this._selectedWordView = wordView;
    this.dispatchEvent(new CustomEvent('selectedWordViewChanged'));
  }

  get selectedWordViews() {
    return this.wordViews.filter(wordView => wordView.isSelected);
  }

  get firstSelectedWordView() {
    return this.selectedWordViews[0];
  }
  get lastSelectedWordView() {
    return this.selectedWordViews[this.selectedWordViews.length - 1];
  }

  get wordViewAtHeadPosition() {
    return this._wordViewAtHeadPosition;
  }
  set wordViewAtHeadPosition(wordView) {
    if (!wordView || wordView === this.wordViewAtHeadPosition) {
      return;
    }
    if (this.wordViewAtHeadPosition) {
      this.wordViewAtHeadPosition.headPosition = false;
    }
    this._wordViewAtHeadPosition = wordView;
    if (this.wordViewAtHeadPosition) {
      this.wordViewAtHeadPosition.headPosition = true;
    }
    this.scrollToWordViewAtHeadPosition();
  }

  get wordViewAtMarkInPosition() {
    return this._wordViewAtMarkInPosition;
  }
  set wordViewAtMarkInPosition(wordView) {
    if (!wordView || wordView === this.wordViewAtMarkInPosition) {
      return;
    }
    this._wordViewAtMarkInPosition = wordView;
    this.updateSelection();
  }

  get wordViewAtMarkOutPosition() {
    return this._wordViewAtMarkOutPosition;
  }
  set wordViewAtMarkOutPosition(wordView) {
    if (!wordView || wordView === this.wordViewAtMarkOutPosition) {
      return;
    }
    this._wordViewAtMarkOutPosition = wordView;
    this.updateSelection();
  }

  scrollToWordViewAtHeadPosition() {
    this.wordViewAtHeadPosition?.scrollIntoView({ block: 'center' });
  }

  // fit markIn and markOut to match word boundaries
  updateMarkInOutToSelectedWordViews() {
    if (!this.firstSelectedWordView || !this.lastSelectedWordView) {
      return;
    }
    this.markInPosition = this.firstSelectedWordView.position;
    this.markOutPosition = (this.lastSelectedWordView.nextWordView?.position || this.lastSelectedWordView.endPosition);
  }

  /* --- find the <eao-word> at the current head position --- */
  onSeek = (e) => {
    this.wordViewAtHeadPosition = this.wordViews.find(wordView => wordView.isAtHeadPosition);
  }

  /* --- find the <eao-word> at the current markIn position --- */
  onMarkInPositionChanged = (e) => {
    this.wordViewAtMarkInPosition = this.wordViews.find(wordView => wordView.isInsideMarkInMarkOut);
  }
  /* --- find the <eao-word> at the current markOut position --- */
  onMarkOutPositionChanged = (e) => {
    this.wordViewAtMarkOutPosition = this.wordViews.findLast(wordView => wordView.isInsideMarkInMarkOut);
  }

  /* --- clear selection of <eao-word>s --- */
  clearSelection() {
    this.selectedWordViews.forEach(wordView => wordView.isSelected = false);
  }

  /* --- update selection of <eao-word>s --- */
  updateSelection() {
    this.clearSelection();
    const wordViewsToSelect = this.wordViews.filter(wordView => wordView.isInsideMarkInMarkOut);
    wordViewsToSelect.forEach(wordView => wordView.isSelected = true);
  }

  /* --- handle update on transcript data --- */
  onPassagesUpdated = (e) => {
    // console.log(e.type);
    this.updateView();
  }

  /* --- handle finish of split and cut operations --- */
  onSplitCutFinished = (e) => {
    // console.log(e.type);
    this.updateView();
  }

  onDataChanged = (e) => {
    const { name, path, source, timelineChanged } = { ...e.detail };
    // console.log(e.detail);
    // console.log(name, path, source.constructor.name);
    // console.log(name + '\n', path, source.constructor.name);
    if (name === 'sequence') {
      // console.log(name + '\n', path, source.constructor.name);
      this.dispatchEvent(new CustomEvent('sequenceChanged', { detail: { eaoTextView: this, eao: this.eao } }));
    }
    if (timelineChanged) {
      // console.log(name, path, source.constructor.name);
      this.updateView();
    }
    if (name === 'value' && source.constructor.name === 'WordData') {
      this.updateView();
    }
    if (name === 'title') {
      this.eaoSequence.zoomFitDuration();
    }
  }

  onEaoSequenceMouseUp = (e) => {
    this.updateMarkInOutToSelectedWordViews();
  }


  addEaoSequenceEventListeners(eaoSequence) {
    if (!eaoSequence?.eaoRef) {
      return;
    }
    /* --- handle events that should cause the <eao-word>s to be recalculated --- */
    eaoSequence.eaoRef.addEventListener('passagesUpdated', this.onPassagesUpdated);
    eaoSequence.eaoRef.addEventListener('splitCutFinished', this.onSplitCutFinished);
    eaoSequence.eaoRef.addEventListener('dataChanged', this.onDataChanged);

    /* --- handle events for managing position and selection UI --- */
    eaoSequence.eaoRef.addEventListener('seek', this.onSeek);
    eaoSequence.eaoRef.addEventListener('markInPositionChanged', this.onMarkInPositionChanged);
    eaoSequence.eaoRef.addEventListener('markOutPositionChanged', this.onMarkOutPositionChanged);

    /* --- handle mouse events in the <eao-sequence>, workspace, root layer --- */
    this.eaoSequence.addEventListener('mouseup', this.onEaoSequenceMouseUp);
  }

  removeEventListeners(eao) {

  }

  /* --- create <eao-word>s in this.mainView according to current state of eao.transcript --- */
  updateView = () => {
    if (!this.mainView || !this.eao) {
      return;
    }
    while (this.paragraphViews?.length) {
      const paragraphToRemove = this.paragraphViews.pop();
      paragraphToRemove.remove();
    }

    /* --- split eao.transcript.words by speaker to create paragraphs --- */
    /* --- can be enhanced by use of word.customData to force paragraphs within one speaker's passage -- */
    const words = this.eao.transcript.words;
    if (!words?.length) {
      return;
    }
    const paragraphs = [
      {
        speaker: words[0].speaker,
        words: [
          words[0]
        ]
      }
    ];
    for (let i = 1; i < words.length; i++) {
      const currentParagraph = paragraphs[paragraphs.length - 1];
      /* --- customData is arbitrary... using customData.newline here just as a suggestion --- */
      if (words[i].customData?.newline || words[i].speaker !== currentParagraph.speaker) {
        paragraphs.push({
          speaker: words[i].speaker,
          words: [
            words[i]
          ]
        });
        continue;
      }
      currentParagraph.words.push(words[i]);
    }
    for (const paragraph of paragraphs) {
      const paragraphView = new EaoParagraph(this, paragraph.words, paragraph.speaker);
      this.paragraphViews.push(paragraphView);
      this.mainView.appendChild(paragraphView);
    }
    this.updateSelection();
    this.onSeek();
    this.dispatchEvent(new CustomEvent('viewUpdated'));
  }

  /* --- capture <eao-word> where dragging starts --- */
  onMouseDown = (e) => {
    if (e.buttons !== 1) {
      return;
    }
    this.mouseData.wordViewAtMouseDown = e.composedPath().find(element => element.constructor.name === 'EaoWordView');
    this.mouseData.wordViewUnderMouse = e.composedPath().find(element => element.constructor.name === 'EaoWordView');
    this.mouseData.shouldClick = true;
  }

  /* --- update markIn markOut according to drag over <eao-word>s --- */
  onMouseMove = (e) => {
    /* --- LMB --- */
    if (e.buttons !== 1 || !this.mouseData?.wordViewAtMouseDown) {
      return;
    }
    const wordViewUnderMouse = e.composedPath().find(element => element.constructor.name === 'EaoWordView');
    if (!wordViewUnderMouse) {
      return;
    }
    this.mouseData.wordViewUnderMouse = wordViewUnderMouse;
    this.mouseData.shouldClick = wordViewUnderMouse === this.mouseData.wordViewAtMouseDown;
    /* --- dragging "forward" (or on the same word) in the transcript --- */
    if (this.mouseData.wordViewUnderMouse.position >= this.mouseData.wordViewAtMouseDown.position) {
      this.markInPosition = this.mouseData.wordViewAtMouseDown.position;
      this.markOutPosition = (this.mouseData.wordViewUnderMouse.nextWordView?.position || this.mouseData.wordViewUnderMouse.endPosition);
      return;
    }
    /* --- dragging "backward" in the transcript --- */
    if (this.mouseData.wordViewUnderMouse.position < this.mouseData.wordViewAtMouseDown.position) {
      this.markOutPosition = (this.mouseData.wordViewAtMouseDown.nextWordView?.position || this.mouseData.wordViewAtMouseDown.endPosition);
      this.markInPosition = this.mouseData.wordViewUnderMouse.position;
    }
  }

  /* --- clear this.mouseData --- */
  onMouseUp = (e) => {
    if (this.mouseData.shouldClick) {
      this.selectedWordView = this.mouseData.wordViewUnderMouse;
    }
    this.mouseData.wordViewAtMouseDown = undefined;
    this.eaoSequence.focus();
  }

  /* --- update eao.headPosition to position of dblClick target <eao-word> --- */
  onDblClick = (e) => {
    const wordView = e.composedPath().find(element => element.constructor.name === 'EaoWordView');
    if (wordView) {
      this.headPosition = wordView.position;
    }
  }

  copy = (e, from = this.markInPosition, to = this.markOutPosition, tracks = this.eao.sequence.tracks) => {
    this.eao.copyRange(from, to, tracks);
    this.updateSelection();
    this.eaoSequence.focus();
  }
  cut = (e, from = this.markInPosition, to = this.markOutPosition, tracks = this.eao.sequence.tracks) => {
    console.log(from, to, tracks);
    this.eao.undoRedoManager.createTransaction(() => {
      this.eao.cutRangeAndMove(from, to, tracks);
      this.eao.undoRedoManager.execute(this.manageMarkInMarkOutCutRange);
      this.updateSelection();
      this.eaoSequence.focus();
    });
  }
  crop = (e, from = this.markInPosition, to = this.markOutPosition, tracks = this.eao.sequence.tracks) => {
    this.eao.undoRedoManager.createTransaction(() => {
      this.eao.cutOutsideAndMove(from, to, tracks);
      this.eao.undoRedoManager.execute(this.manageMarkInMarkOutCrop);
      this.updateSelection();
      this.eaoSequence.focus();
    });
  }
  insert = (e, clipboardItem = this.eao.clipboard.items[0], position = this.wordViewAtHeadPosition?.position, tracks = this.eao.sequence.tracks) => {
    /* --- do nothing if there's nothing to do it with --- */
    if (!clipboardItem) {
      console.warn('nothing to insert')
      return;
    }
    /* --- in case there is no wordViewAtHeadPosition (e.g., because the headPosition is beyond the last audio), don't force them to move it... assume they want to paste where the audio ends --- */
    if (!position) {
      this.headPosition = this.eao.sequence.calculateOverallDuration();
    }
    this.eao.undoRedoManager.createTransaction(() => {
      this.eao.insert(clipboardItem, position, tracks);
      this.eao.undoRedoManager.execute(this.manageMarkInMarkOutInsert);
      this.eaoSequence.focus();
    });
  }
  undo = (e) => {
    this.eao.undoRedoManager.undo();
  }
  redo = (e) => {
    this.eao.undoRedoManager.redo();
  }

  /* --- custom undoRedo-able command for managing markIn and markOut positions when cutting range --- */
  get manageMarkInMarkOutCutRange() {
    const command = this.eao.undoRedoManager.createCommand({
      markInPosition: this.markInPosition,
      markOutPosition: this.markOutPosition
    });
    command.execute = () => {
      this.markInPosition = command.state.markInPosition;
      this.markOutPosition = this.markInPosition;
    };
    command.unexecute = () => {
      this.markInPosition = command.state.markInPosition;
      this.markOutPosition = command.state.markOutPosition;
    }
    return command;
  }

  /* --- custom undoRedo-able command for managing markIn and markOut positions when cropping --- */
  get manageMarkInMarkOutCrop() {
    const command = this.eao.undoRedoManager.createCommand({
      headPosition: this.headPosition,
      markInPosition: this.markInPosition,
      markOutPosition: this.markOutPosition
    });
    command.execute = () => {
      this.headPosition = 0;
      this.markInPosition = 0;
      this.markOutPosition = command.state.markOutPosition - command.state.markInPosition;
    };
    command.unexecute = () => {
      this.headPosition = command.state.headPosition;
      this.markInPosition = command.state.markInPosition;
      this.markOutPosition = command.state.markOutPosition;
    }
    return command;
  }

  /* --- custom undoRedo-able command for managing markIn and markOut positions when inserting --- */
  get manageMarkInMarkOutInsert() {
    const command = this.eao.undoRedoManager.createCommand({
      originalMarkInPosition: this.markInPosition,
      originalMarkOutPosition: this.markOutPosition,
      markInPosition: this.headPosition,
      markOutPosition: this.headPosition + this.eao.clipboard.items[0].duration
    });
    command.execute = () => {
      this.markInPosition = command.state.markInPosition;
      this.markOutPosition = command.state.markOutPosition;
    };
    command.unexecute = () => {
      this.markInPosition = command.state.originalMarkInPosition;
      this.markOutPosition = command.state.originalMarkOutPosition;
    }
    return command;
  }

  connectedCallback() {
    this._shadow.innerHTML = this.template;
    this.updateView();

    /* --- listen to self --- */
    this.mainView.addEventListener('mousedown', this.onMouseDown);
    this.mainView.addEventListener('mousemove', this.onMouseMove);
    this.mainView.addEventListener('mouseup', this.onMouseUp);
    this.mainView.addEventListener('dblclick', this.onDblClick);

    /* --- some basic edit controls --- */
    this.copyRangeButton.addEventListener('click', this.copy);
    this.cutRangeAndMoveButton.addEventListener('click', this.cut);
    this.cropButton.addEventListener('click', this.crop);
    this.insertButton.addEventListener('click', this.insert);
    this.undoButton.addEventListener('click', this.undo);
    this.redoButton.addEventListener('click', this.redo);

  }

  disconnectedCallback() {

  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    console.log(`${attribute} changed from ${oldValue} to ${newValue}`);
  }

  get mainView() {
    return this._shadow.querySelector('#mainView');
  }

  get copyRangeButton() {
    return this._shadow.querySelector('#copyRangeButton');
  }
  get cutRangeAndMoveButton() {
    return this._shadow.querySelector('#cutRangeAndMoveButton');
  }
  get cropButton() {
    return this._shadow.querySelector('#cropButton');
  }
  get insertButton() {
    return this._shadow.querySelector('#insertButton');
  }
  get undoButton() {
    return this._shadow.querySelector('#undoButton');
  }
  get redoButton() {
    return this._shadow.querySelector('#redoButton');
  }

  get template() {
    return `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
          width: 100vw;
        }
        #mainView {
          height: 200px;
          overflow: scroll;
          background: white;
          margin: 0 auto;
        }
        #controls {
          display: flex;
          flex-flow: row nowrap;
          justify-content: space-evenly;
          align-items: center;
        }
      </style>
      <div id="controls">
        <div id="editControls">
          <button id="copyRangeButton" title="Copy range to clipboard (copyRange)">Copy Range</button>
          <button id="cutRangeAndMoveButton" title="Cut range to clipboard and close gap (cutRangeAndMove)">Cut Range</button>
          <button id="cropButton" title="Crop to Selection (cutOutsideAndMove)">Crop</button>
          <button id="insertButton" title="Insert from clipboard (insert)">Insert</button>
        </div>
        <div id="undoRedoControls">
          <button id="undoButton" title="Undo">Undo</button>
          <button id="redoButton" title="Redo">Redo</button>
        </div>
      </div>
      <div id="mainView"></div>
    `;
  }
}

customElements.define('eao-text-view', EaoTextView);
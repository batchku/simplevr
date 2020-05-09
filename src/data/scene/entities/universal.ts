import { BaseElement } from 'data/scene/entities/baseElement';
import { DEFAULT_VOLUME } from 'ui/common/constants';
import { DEFAULT_FILE_NAME } from '../../../ui/common/constants';
import { MediaFile } from './mediaFile';


export class Universal extends BaseElement {
  private _textContent: string;
  private _audioContent: MediaFile = new MediaFile();
  private _imageContent: MediaFile = new MediaFile();
  private _volume: number = DEFAULT_VOLUME;
  private _loop: boolean = false;

  constructor() {
    super();
  }

  get hasData(): boolean {
    return !!this.textContent || this.audioContent.hasAsset() || this.imageContent.hasAsset();
  }

  get textContent(): string {
    return this._textContent;
  }

  set textContent(content: string) {
    this._textContent = (content || '').slice(0, 245);
  }

  get audioContent(): MediaFile {
    return this._audioContent;
  }

  get imageContent(): MediaFile {
    return this._imageContent;
  }

  get volume(): number {
    return this._volume;
  }

  set volume(vol: number) {
    this._volume = (typeof vol === 'undefined' || vol === null) ? DEFAULT_VOLUME : vol;
  }

  get loop(): boolean {
    return this._loop;
  }

  set loop(isLoop: boolean) {
    this._loop = isLoop;
  }

  setAudioMediaFile(mediaFile) {
    this._audioContent = mediaFile;
  }

  setAudioContent(binaryFileData: string, volume: number = DEFAULT_VOLUME) {
    this._audioContent.setBinaryFileData(binaryFileData);
    this.volume = volume;
  }

  setImageMediaFile(mediaFile) {
    this._imageContent = mediaFile;
  }

  setImageContent(binaryFileData: string) {
    this._imageContent.setBinaryFileData(binaryFileData);
  }

  resetAudioContent() {
    this.setAudioContent(null);
    this._audioContent.setRemoteFile(null);
  }

  resetImageContent() {
    this.setImageContent(null);
    this._imageContent.setRemoteFile(null);
  }

  getIcon(): string {
    const parts = [];

    if (this.imageContent.hasAsset()) {
      parts.push('image');
    }

    if (this.textContent) {
      parts.push('text');
    }

    if (this.audioContent.hasAsset()) {
      parts.push('audio');
    }

    return `icon-${parts.length > 0 ? parts.join('-') : 'add'}.svg`;
  }

  toJson() {
    return Object.assign(super.toJson(), {
      imageFile: this._imageContent.getFileName(),
      audioFile: this._audioContent.getFileName(),
      remoteImageFile: this._imageContent.getRemoteFile(),
      remoteAudioFile: this._audioContent.getRemoteFile(),
      text: this._textContent,
      loop: this._loop,
      volume: this._volume,
      size: '<2,1>', //TODO: get requirements for size vector
    });
  }
}


import { Audio } from 'data/scene/entities/audio';
import { Room } from 'data/scene/entities/room';

import { DEFAULT_PROJECT_DESCRIPTION, DEFAULT_PROJECT_NAME, DEFAULT_VOLUME } from 'ui/common/constants';

class RoomManager {
  private projectName: string;
  private projectTags: string;
  private projectDescription: string;
  private rooms: Set<Room>;
  private homeRoomId: string;
  private isReadOnly: boolean = false;
  private soundtrack: Audio = new Audio();

  constructor() {
    this.initValues();
  }

  initValues() {
    this.projectName = DEFAULT_PROJECT_NAME;
    this.projectDescription = DEFAULT_PROJECT_DESCRIPTION;
    this.projectTags = '';
    this.rooms = new Set<Room>();
    this.homeRoomId = '';
  }

  addRoom(room: Room) {
    if (room) {
      this.rooms.add(room);
    }
  }

  getRoomById(roomId: string): Room {
    return Array.from(this.rooms)
      .find(room => room.getId() === roomId);
  }

  removeRoomById(roomId: string) {
    this.rooms.delete(this.getRoomById(roomId));
  }

  getRooms(): Set<Room> {
    return this.rooms;
  }

  clearRooms() {
    this.rooms = new Set<Room>();
  }

  getProjectName(): string {
    return this.projectName;
  }

  setProjectName(projectName: string) {
    this.projectName = projectName;
  }

  getProjectDescription(): string {
    return this.projectDescription;
  }

  setProjectDescription(projectDescription: string) {
    this.projectDescription = projectDescription;
  }

  getHomeRoomId(): string {
    if (!this.homeRoomId) {
      return Array.from(this.getRooms())[0].getId();
    }
    return this.homeRoomId;
  }

  setHomeRoomId(homeRoomId: string) {
    this.homeRoomId = homeRoomId;
  }

  getProjectIsEmpty(): boolean {
    return this.rooms.size === 0;
  }

  getProjectTags(): string {
    return this.projectTags;
  }

  setProjectTags(tags: string) {
    this.projectTags = tags;
  }

  getIsReadOnly(): boolean {
    return this.isReadOnly;
  }

  setIsReadOnly(isReadOnly: boolean) {
    this.isReadOnly = isReadOnly;
  }

  getSoundtrack(): Audio {
    return this.soundtrack;
  }

  setSoundtrack(fileName: string, volume: number, dataUrl) {
    if (fileName === undefined || fileName === null) {
      this.soundtrack.setFileName('');
    } else {
      this.soundtrack.setFileName(fileName);
      this.soundtrack.setBinaryFileData(dataUrl);
      this.soundtrack.setVolume(volume);
    }
  }

  setSoundtrackMediaFile(mediaFile = null, volume: number = 0.5) {
    this.soundtrack.setMediaFile(mediaFile);
    this.setSoundtrackVolume(volume);
  }

  setSoundtrackVolume(v: number) {
    if (v === undefined || v === null) {
      v = DEFAULT_VOLUME;
    }

    this.soundtrack.setVolume(v);
  }

  removeSoundtrack() {
    this.soundtrack = new Audio();
  }

  getSoundtrackVolume(): number {
    return this.soundtrack.getVolume();
  }
}
export default new RoomManager();

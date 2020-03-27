import { Injectable } from '@angular/core';
import { ProjectInteractor } from 'core/project/projectInteractor';
import { SceneInteractor } from 'core/scene/sceneInteractor';
import { StorageInteractor } from 'core/storage/storageInteractor';

import { EventBus } from 'ui/common/event-bus';

@Injectable()
export class ZipFileReader {

  constructor(
    private sceneInteractor: SceneInteractor,
    private storageInteractor: StorageInteractor,
    private projectInteractor: ProjectInteractor,
    private eventBus: EventBus,
  ) {
  }

	loadFile(zipFile: any) {
		this.eventBus.onStartLoading();
		return this.storageInteractor.deserializeProject(zipFile)
		.then((response) => {
			this.sceneInteractor.setActiveRoomId(null);
			this.projectInteractor.setProject(null);
			this.eventBus.onSelectRoom(null, false);
			this.eventBus.onStopLoading();
		})
		.catch((error) => {
			const errorMessage: string = `The zip file does not seem to be a properly formatted story file. \n Error received: ${error}`;
			this.eventBus.onModalMessage('File Upload Error', errorMessage);
			this.eventBus.onStopLoading();
		})
	}
}

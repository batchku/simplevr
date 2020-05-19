import { Component, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import eventBus, { EventType } from 'ui/common/event-bus';
import zipFileReader from 'ui/editor/util/zipFileReader';


@Component({
  selector: 'hidden-file-loader',
  styleUrls: ['./hidden-file-loader.scss'],
  templateUrl: './hidden-file-loader.html',
})
export class HiddenFileLoader {

  private subscriptions: Set<Subscription> = new Set<Subscription>();

  @ViewChild('hiddenLabel') hiddenLabel;

  ngOnInit() {
    const onEvent: Subscription = eventBus.getObservable(EventType.OPEN_FILE_LOADER)
      .subscribe(
        event => this.hiddenLabel.nativeElement.click(),
        error => console.log('error', error),
      );

    this.subscriptions.add(onEvent);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onFileChange($event) {
    const file = $event.target.files && $event.target.files[0];
    if (!file) {
      eventBus.onModalMessage('Error', 'No valid file selected');
      return;
    }
    zipFileReader.loadFile(file);
  }
}

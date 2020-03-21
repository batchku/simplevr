import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ProjectInteractor } from 'core/project/projectInteractor';
import { UserInteractor } from 'core/user/userInteractor';

import { ApiService } from 'data/api/apiService';
import * as QRCode from 'qrcode';
import { Observable } from 'rxjs/Observable';
import { copyToClipboard } from 'ui/editor/util/clipboard';
import { getShareableLink } from 'ui/editor/util/publicLinkHelper';
import { Project } from 'data/project/projectModel';

@Component({
  selector: 'shareable-modal',
  styleUrls: ['./shareable-modal.scss'],
  templateUrl: './shareable-modal.html',
})
export class ShareableModal {

  @Output() onClose = new EventEmitter();
  @Input() shareableData;
  @ViewChild('qrCodeElem') qrCodeElem;
  private isPublic = false;
  private publicLink = '';
  private projectName = '';
  private notificationIsVisible = false;

  constructor(
    private projectInteractor: ProjectInteractor,
    private userInteractor: UserInteractor,
    private apiService: ApiService,
  ) {
  }


  ngOnInit() {
    const projectId = this.shareableData.projectId;

    this.projectInteractor.getProjectData(projectId).then((response) => {
      const projectData = response.data() as Project;

      const publicLink = getShareableLink(projectId);

      this.isPublic = projectData.isPublic;
      this.projectName = projectData.name;

      return this.isPublic ? publicLink : null;
    }).then((link) => {
      return link ? this.apiService.getShortenedUrl(link) : Observable.empty()
    }).then((response) => {
      response.subscribe(
        (shortenedUrl: string) => {
          this.publicLink = shortenedUrl;
          this.setQRCode(this.publicLink);
        },
        error => console.error('getShortUrl error', error),
      );
    });
  }

  public closeModal($event, isAccepted: boolean) {
    this.onClose.emit({ isAccepted });
  }

  public projectIsPublic(): boolean {
    return this.isPublic;
  }

  public onCheckboxChange() {
    const projectId = this.shareableData.projectId;

    this.isPublic = !this.isPublic;

    this.projectInteractor.updateSharableStatus(projectId, this.isPublic)
      .then(() => {
        const publicLink = getShareableLink(projectId);

        return this.isPublic ? publicLink : null;
      })
      .then(publicLink => publicLink ? this.apiService.getShortenedUrl(publicLink).toPromise() : null)
      .then(
        (shortenedUrl) => {
          this.publicLink = shortenedUrl;
          // this.setQRCode(this.publicLink);
        },
        error => console.error('getShortUrl error', error),
      );
  }

  setQRCode(link: string) {
    QRCode.toCanvas(
      this.qrCodeElem.nativeElement,
      link,
      (error) => error ? console.error(error) : console.log('generated QR'),
    );
  }

  onPublicLinkClick() {
    copyToClipboard(this.publicLink)
      .then(() => {
        this.notificationIsVisible = true;
        setTimeout(() => this.notificationIsVisible = false, 2000);
      })
      .catch(error => console.log('copyToClipboard error', error));
  }

}

import { resourceSelector } from "../../../../resource-address";
import {Component, Input, OnDestroy, ChangeDetectionStrategy, TemplateRef, ViewChild} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {MessageHandlerService} from "../../../../services/message-handler.service";
import {globalAppConfig} from "../../../../../environments/global-app-config";
import { serverErrorText } from '../../util/server-error';

@Component({
  selector: 'app-doi-saver',
  templateUrl: './doi-saver.component.html',
  styleUrls: ['./doi-saver.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class DoiSaverComponent implements OnDestroy{

  @Input() sourceArtifactId: string = '';

  /** The notices this component reports, which the page draws in a row under the action buttons. */
  @ViewChild('notices', { static: true }) notices!: TemplateRef<unknown>;

  httpPostSubscription = new Subscription();

  showProgress = false;
  showSuccess = false;
  showError = false;
  progressMessage = 'Processing...';
  successMessage = '';
  errorMessage = '';

  constructor(private httpClient: HttpClient, private messageHandlerService: MessageHandlerService) {
  }

  saveDoi(event:any): void {
    this.httpPostSubscription.add(
      this.httpRequest().subscribe(
        (data: any) => {
          if (data instanceof HttpResponse) {
            this.clearProgress();
            this.clearError();
            this.showSuccess = true;
            this.successMessage = 'Draft DOI saved successfully! The DOI is:  ' + data.body.doiName;
            this.messageHandlerService.traceObject('Data received from the server:', data);
          } else {
            this.clearSuccess();
            this.clearError();
            this.showProgress = true;
          }
        },
        (error: any) => {
          this.clearProgress();
          this.clearSuccess();
          this.showError = true;

          this.errorMessage = "Error Saving A Draft DOI - " + serverErrorText(error);

          if (typeof error === 'object' && error.hasOwnProperty('message')) {
            this.messageHandlerService.errorObject(error['message'], error);
          }
        }
      )
    );
    this.stopPropagation(event);
  }

  private httpRequest(): Observable<any> {
    const url = globalAppConfig.bridgeUrl + 'datacite/create-doi?source_artifact_id=' +
      encodeURIComponent(resourceSelector(this.sourceArtifactId ?? '')) + '&state=draft';

    //TODO: how to get the datacite instance metadata?
    const cee: any = document.querySelector('cedar-embeddable-editor');
    const meta = cee.currentMetadata;
    const body = meta;

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let method = 'POST';

    return this.httpClient.request(method, url, {
      body,
      headers: httpHeaders,
      observe: 'events',
      reportProgress: true,
      responseType: 'json',
    });
  }

  clearProgress(): void {
    this.showProgress = false;
  }

  clearSuccess(): void {
    this.showSuccess = false;
    this.successMessage = '';
  }

  clearError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  stopPropagation(event: any): void {
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.httpPostSubscription.unsubscribe();
  }

}

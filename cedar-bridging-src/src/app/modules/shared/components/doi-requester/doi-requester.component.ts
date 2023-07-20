import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {environment} from "../../../../../environments/environment";
import {MessageHandlerService} from "../../../../services/message-handler.service";
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'app-doi-requester',
  templateUrl: './doi-requester.component.html',
  styleUrls: ['./doi-requester.component.scss']
})
export class DoiRequesterComponent implements OnInit, OnDestroy{
  // Number of milliseconds to display the submission success message
  private static readonly SUCCESS_MESSAGE_TIMEOUT = 5000;

  @Input() sourceArtifactId: string = '';
  @Input() state: string = '';

  httpPostSubscription = new Subscription();

  showProgress = false;
  showSuccess = false;
  showError = false;
  progressMessage = 'Processing...';
  successMessage = '';
  errorMessage = '';

  constructor(private httpClient: HttpClient, private messageHandlerService: MessageHandlerService) {
  }

  ngOnInit(): void {
  }

  createDoi(event:any): void {
    this.httpPostSubscription.add(
      this.httpRequest().subscribe(
        (data: any) => {
          if (data instanceof HttpResponse) {
            this.clearProgress();
            this.clearError();
            this.showSuccess = true;
            this.successMessage = 'DOI created successfully! The DOI is:  ' + data.body.doiName;
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

          const returnedErrorMessage = error['error']['errorMessage'];
          let splitErrorMessage = "";
          if (returnedErrorMessage != null) {
            splitErrorMessage = returnedErrorMessage.split(":").slice(1).join(":").trim();
            console.log(splitErrorMessage);
          }
          this.errorMessage = "Error Creating A DOI - " + splitErrorMessage;

          if (typeof error === 'object' && error.hasOwnProperty('message')) {
            this.messageHandlerService.errorObject(error['message'], error);
          }
        },
        () => {
          // remove success message in SUCCESS_MESSAGE_TIMEOUT seconds (
          if (this.showSuccess) {
            setTimeout(() => {
              this.clearSuccess();
            }, DoiRequesterComponent.SUCCESS_MESSAGE_TIMEOUT);
          }
        }
      )
    );
    this.stopPropagation(event);
  }

  private httpRequest(): Observable<any> {
    const url = globalAppConfig.bridgeUrl + 'datacite/create-doi?source_artifact_id=' +
      encodeURIComponent(this.sourceArtifactId ?? '') + '&state=publish';

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


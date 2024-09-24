import {Injectable} from '@angular/core';
import {globalAppConfig} from "../../environments/global-app-config";

@Injectable({
  providedIn: 'root'
})
export class RestApiUrlService {

  private readonly API_RESOURCE_URL: string;

  constructor() {
    this.API_RESOURCE_URL = globalAppConfig.resourceUrl;
  }

  private resourceBase() {
    return `${this.API_RESOURCE_URL}`;
  }

  private resourceTemplates() {
    return `${this.resourceBase()}templates`;
  }

  public downloadTemplate(templateId: string) {
    return `${this.resourceTemplates()}/${encodeURIComponent(templateId)}/download?download=true`;
  }

}

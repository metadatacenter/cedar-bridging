import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RestApiUrlService {

  private readonly API_URL: string;

  constructor() {
    this.API_URL = environment.apiUrl;
  }

  private base() {
    return `${this.API_URL}`;
  }

  private templates() {
    return `${this.base()}templates`;
  }

  private templateInstances() {
    return `${this.base()}template-instances`;
  }

  public template(templateId: string) {
    return `${this.templates()}/${encodeURIComponent(templateId)}`;
  }

  public templateInstance(instanceId: string) {
    return `${this.templateInstances()}/${encodeURIComponent(instanceId)}`;
  }

}

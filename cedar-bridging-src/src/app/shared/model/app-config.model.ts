import {environment} from '../../../environments/environment';

export class AppConfig {
  appUrl: string = '';
  cedarUrl: string = '';
  bridgeUrl: string = '';
  terminologyBaseUrl: string = '';
  keycloakUrl: string = '';
  loaded: boolean = false;

  init(appConfig: AppConfig) {
    const domain = environment.cedarDomain;
    this.appUrl = appConfig.appUrl.replace('{{cedarDomain}}', domain);
    this.cedarUrl = appConfig.cedarUrl.replace('{{cedarDomain}}', domain);
    this.bridgeUrl = appConfig.bridgeUrl.replace('{{cedarDomain}}', domain);
    this.terminologyBaseUrl = appConfig.terminologyBaseUrl.replace('{{cedarDomain}}', domain);
    this.keycloakUrl = appConfig.keycloakUrl.replace('{{cedarDomain}}', domain);
    this.loaded = true;
  }
}


import {environment} from '../../../environments/environment';
import {useDeploymentDomain} from '../../resource-address';

export class AppConfig {
  appUrl: string = '';
  cedarUrl: string = '';
  bridgeUrl: string = '';
  terminologyBaseUrl: string = '';
  keycloakUrl: string = '';
  loaded: boolean = false;

  init(appConfig: AppConfig) {
    const domain = environment.cedarDomain;
    // Identities are minted on repo.<domain>, and only those are addressed in the compact form.
    useDeploymentDomain(domain);
    this.appUrl = appConfig.appUrl.replace('{{cedarDomain}}', domain);
    this.cedarUrl = appConfig.cedarUrl.replace('{{cedarDomain}}', domain);
    this.bridgeUrl = appConfig.bridgeUrl.replace('{{cedarDomain}}', domain);
    this.terminologyBaseUrl = appConfig.terminologyBaseUrl.replace('{{cedarDomain}}', domain);
    this.keycloakUrl = appConfig.keycloakUrl.replace('{{cedarDomain}}', domain);
    this.loaded = true;
  }
}


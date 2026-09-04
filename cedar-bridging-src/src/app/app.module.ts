import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SnotifyModule, SnotifyService, ToastDefaults} from "ng-alt-snotify";
import {SharedModule} from "./modules/shared";
import {DoiModule} from "./modules/doi/doi.module";
import {MaterialModule} from "./modules/material-module";
import {provideHttpClient, withInterceptorsFromDi, withXhr} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {initializeKeycloak} from "./init/keycloak-init.factory";
import {KeycloakAngularModule, KeycloakService} from "keycloak-angular";
import {AppConfigService} from "./services/app-config.service";



const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

@NgModule({
  declarations: [
    AppComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SnotifyModule,
    SharedModule,
    DoiModule,
    MaterialModule,
    KeycloakAngularModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideTranslateHttpLoader(),
    SnotifyService,
    {
      provide: 'SnotifyToastConfig',
      useValue: ToastDefaults
    },
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {SharedModule} from '../shared';
import {DoiRoutingModule} from './doi-routing.module';
import {MaterialModule} from '../material-module';
import {DataciteCreateInstanceComponent} from "./pages/datacite-create-instance/datacite-create-instance.component";


@NgModule({
  declarations: [
    DataciteCreateInstanceComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    SharedModule,
    DoiRoutingModule,
    MaterialModule
  ],
  exports: [],
  providers: []
})
export class DoiModule {
}

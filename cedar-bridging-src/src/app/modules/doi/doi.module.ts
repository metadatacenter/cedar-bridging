import {NgModule} from '@angular/core';
import {SharedModule} from '../shared';
import {DoiRoutingModule} from './doi-routing.module';
import {MaterialModule} from '../material-module';
import {DataciteCreateInstanceComponent} from "./pages/datacite-create-instance/datacite-create-instance.component";
import {DataciteEditInstanceComponent} from "./pages/datacite-edit-instance/datacite-edit-instance.component";


@NgModule({
  declarations: [
    DataciteCreateInstanceComponent,
    DataciteEditInstanceComponent,
  ],
  imports: [
    SharedModule,
    DoiRoutingModule,
    MaterialModule
  ],
  exports: [],
  providers: [],
  entryComponents: []
})
export class DoiModule {
}

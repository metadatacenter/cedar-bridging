import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from './components/spinner/spinner.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {MaterialModule} from '../../modules/material-module';
import {HeaderComponent} from "./components/header/header.component";
import {ClipboardModule} from "@angular/cdk/clipboard";
import { DoiRequesterComponent } from './components/doi-requester/doi-requester.component';
import { CancelComponent } from './components/cancel/cancel.component';
import { DoiSaverComponent } from './components/doi-saver/doi-saver.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
    ClipboardModule,
  ],
  declarations: [
    SpinnerComponent,
    DashboardComponent,
    HeaderComponent,
    DoiRequesterComponent,
    CancelComponent,
    DoiSaverComponent,
  ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        TranslateModule,
        SpinnerComponent,
        HeaderComponent,
        DoiRequesterComponent,
        CancelComponent,
        DoiSaverComponent,
    ]
})
export class SharedModule {
}

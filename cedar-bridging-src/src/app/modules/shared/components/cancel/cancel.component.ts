import {Component, Input, Inject} from '@angular/core';
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelComponent {
  @Input() operation: string = '';
  window: any;
  constructor(@Inject(DOCUMENT) private _document:any) {
    this.window = this._document.defaultView;
  }
  cancel() {
    self.close();
  }
}

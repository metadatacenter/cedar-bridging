import {Component, Input, Inject, DOCUMENT, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
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

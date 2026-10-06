import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CancelComponent {
  cancel() {
    self.close();
  }
}

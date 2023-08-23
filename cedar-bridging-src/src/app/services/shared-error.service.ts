import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedErrorService {
  showErrorChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  updateShowError(showError: boolean) {
    this.showErrorChange.emit(showError);
  }
}

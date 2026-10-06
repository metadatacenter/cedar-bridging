import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageHandlerService {

  traceObject(label: string, value: object): void {
    console.log('TRACE: ' + label);
    console.log(value);
  }

  errorObject(label: string, value: object): void {
    console.error('ERROR: ' + label);
    console.error(value);
  }

}

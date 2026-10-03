import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UiService {

  openUrlInBlank(destination: string) {
    window.open(destination, '_blank');
  }

}

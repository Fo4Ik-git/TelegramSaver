import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProgressServiceService {
  private progressSubject = new Subject<number>();
  public progress$ = this.progressSubject.asObservable();

  updateProgress(progress: number) {
    this.progressSubject.next(progress);
  }
}

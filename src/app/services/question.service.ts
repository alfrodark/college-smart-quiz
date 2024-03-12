import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private baseUrl = 'assets/';

  constructor(private http: HttpClient) {}

  getQuestions(category: string): Observable<any> {
    const url = `${this.baseUrl}${category}.json`;
    return this.http.get(url);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private http: HttpClient) {}

  exportBlog$(userId: string): Observable<any> {
    return this.http
      .get(`http://localhost:3001/api/blogs/${userId}`, {
        responseType: 'blob',
      })
      .pipe(
        map((res) => {
          return res;
        }),
        catchError((e) => of(undefined))
      );
  }
}

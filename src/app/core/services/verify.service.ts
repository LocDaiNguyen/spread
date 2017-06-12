import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { User } from '../../models/user.model';

@Injectable()
export class VerifyService {

  private verificationsUrl = '/api/verifications';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getVerify(hash: string): Observable<any> {
    const verifyUrl = `${this.verificationsUrl}/${hash}`;
    return this.http.get(verifyUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  createVerify(email: string): Observable<any> {
    return this.http.post(this.verificationsUrl, JSON.stringify(email), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  deleteVerify(verifyId: string): Observable<any> {
    const verifyUrl = `${this.verificationsUrl}/${verifyId}`;
    return this.http.delete(verifyUrl, this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

}

import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class SettingService {

  private settingsUrl = 'api/settings';
  private headers = {headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'})};

  constructor(
    private http: Http
  ) { }

  getAllSettings(): Observable<any[]> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const settingsUrl = `${this.settingsUrl}${token}`;
    return this.http.get(settingsUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  getSetting(settingId: string): Observable<any> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const settingUrl = `${this.settingsUrl}/${settingId}${token}`;
    return this.http.get(settingUrl)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

  updateSetting(setting: any): Observable<any> {
    const token = localStorage.getItem('token') ? '?token=' + localStorage.getItem('token') : '';
    const settingUrl = `${this.settingsUrl}/${setting._id}${token}`;
    return this.http.patch(settingUrl, JSON.stringify(setting), this.headers)
      .map((response: Response) => response.json().data)
      .catch((error: Response) => Observable.throw(error.json().data));
  }

}

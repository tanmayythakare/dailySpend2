import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private api: ApiService) {}

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/v1/profile');
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.api.patch<UserProfile>('/v1/profile', profile);
  }
}

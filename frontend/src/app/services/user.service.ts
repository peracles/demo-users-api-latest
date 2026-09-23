import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly GQL = '/graphql';

  getUsers(): Observable<UserProfile[]> {
    const query = `{
      users {
        id userId firstName lastName phone avatarUrl bio createdAt updatedAt
      }
    }`;
    return this.http
      .post<{ data: { users: UserProfile[] } }>(this.GQL, { query })
      .pipe(map((res) => res.data.users));
  }

  getUserById(id: string): Observable<UserProfile | null> {
    const query = `query ($id: UUID!) {
      userById(id: $id) {
        id userId firstName lastName phone avatarUrl bio createdAt updatedAt
      }
    }`;
    return this.http
      .post<{ data: { userById: UserProfile | null } }>(this.GQL, {
        query,
        variables: { id },
      })
      .pipe(map((res) => res.data.userById));
  }

  updateUser(id: string, input: UpdateUserInput): Observable<UserProfile> {
    const query = `mutation ($id: UUID!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id userId firstName lastName phone avatarUrl bio createdAt updatedAt
      }
    }`;
    return this.http
      .post<{ data: { updateUser: UserProfile } }>(this.GQL, {
        query,
        variables: { id, input },
      })
      .pipe(map((res) => res.data.updateUser));
  }

  deleteUser(id: string): Observable<boolean> {
    const query = `mutation ($id: UUID!) {
      deleteUser(id: $id)
    }`;
    return this.http
      .post<{ data: { deleteUser: boolean } }>(this.GQL, {
        query,
        variables: { id },
      })
      .pipe(map((res) => res.data.deleteUser));
  }
}

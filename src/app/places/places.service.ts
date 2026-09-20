import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  httpClient = inject(HttpClient);
  errorService = inject(ErrorService);
  private userPlaces = signal<Place[]>([]);
  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Er is een fout opgetreden bij het ophalen van de data, probeer het later nog maar een keertje ',
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Er is een fout opgetreden bij het ophalen van jouw favoriete plaatsen........',
    ).pipe(tap((userPlaces) => this.userPlaces.set(userPlaces)));
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.update((currentPlaces) => [...currentPlaces, place]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', { placeId: place.id })
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('foutje bij updaten userPlaces');
          return throwError(
            () => new Error('foutje bij updaten van de userPlaces'),
          );
        }),
      );
  }

  removeUserPlace(place: Place) {
    return this.httpClient
      .delete('http://localhost:3000/user-places/' + place.id)
      .pipe(
        catchError((error) => {
          this.errorService.showError('Fout bij verwijderen fav place');
          return throwError(() => new Error('fout bij verwijderen fav place'));
        }),
        tap(() => {
          const prevPlaces = this.userPlaces();
          if (this.userPlaces().some((p) => p.id === place.id)) {
            this.userPlaces.set(prevPlaces.filter((p) => p.id !== place.id));
          }
        }),
      );
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((respData) => respData.places),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(errorMessage));
      }),
    );
  }
}

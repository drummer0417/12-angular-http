import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  placesService = inject(PlacesService);
  destroyRef = inject(DestroyRef);

  error = signal('');
  isFetching = signal(false);
  places = this.placesService.loadedUserPlaces;

  ngOnInit(): void {
    this.isFetching.set(true);
    const httpSubscription = this.placesService.loadUserPlaces().subscribe({
      error: (error: string) => {
        this.error.set(error);
      },
      complete: () => this.isFetching.set(false),
    });
    this.destroyRef.onDestroy(() => httpSubscription.unsubscribe);
  }

  onDeletePlacce(place:  Place) {
    console.log(place.id);
    
    const subscription = this.placesService.removeUserPlace(place).subscribe({
      next: () => console.log('place removed from fav'),
      error: (error) => console.log(error),
      complete: () => console.log('in user-places.component.ts: klaar'),
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}




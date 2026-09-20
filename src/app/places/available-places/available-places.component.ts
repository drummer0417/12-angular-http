import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  placeService = inject(PlacesService);
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const placesServeSubscription = this.placeService.loadAvailablePlaces()
      .subscribe({
        next: (response) => {
          console.log(response);
          this.places.set(response);
        },
        error: (error) => {
          this.error.set(error);
        },
        complete: () => this.isFetching.set(false),
      });
    this.destroyRef.onDestroy(() => placesServeSubscription.unsubscribe);
  }

  onSelectPlace(selectedPlace: Place) {
    const placesServeSubscription =    this.placeService.addPlaceToUserPlaces(selectedPlace)
      .subscribe({
        next: (response) => console.log(response),        
      });
      this.destroyRef.onDestroy(() => placesServeSubscription.unsubscribe())
  }
}

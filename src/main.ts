import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import {
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { tap } from 'rxjs';

function loggingInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  console.log('[Outgoing request]');
  console.log(request);

  //     const clonedRequest = request.clone({
  //         headers: request.headers.set('dummy-header', 'ik ben een dummy header')
  //     });
  //   return next(clonedRequest);
  return next(request).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log('[Incomming response]');
          console.log(event.status);
          console.log(event.body);
        }
      },
    }),
  );
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([loggingInterceptor]))],
}).catch((err) => console.error(err));

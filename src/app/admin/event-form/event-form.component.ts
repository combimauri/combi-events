import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { clearEventSeoCache } from '@core/guards';
import { AppEvent } from '@core/models';
import {
  AuthService,
  EVENT_IMAGE_MAX_BYTES,
  EventFormData,
  EventImageKind,
  EventsService,
  LoggerService,
} from '@core/services';
import { EventState, LoadingState } from '@core/states';
import { PageTitleComponent } from '@shared/components';
import { filter, map, startWith } from 'rxjs';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Top-level paths that an event id would shadow (events live at /:eventId).
const RESERVED_IDS = ['admin', 'login'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

// `<input type="datetime-local">` works with local "YYYY-MM-DDTHH:mm" strings.
const toDateTimeLocal = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

const parseEmails = (value: string): string[] =>
  value
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const reservedIdValidator: ValidatorFn = (control) =>
  RESERVED_IDS.includes(control.value) ? { reserved: true } : null;

const emailListValidator: ValidatorFn = (control) =>
  parseEmails(control.value ?? '').every((email) => EMAIL_PATTERN.test(email))
    ? null
    : { emailList: true };

const dateRangeValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;

  return start && end && new Date(end) <= new Date(start)
    ? { dateRange: true }
    : null;
};

// Latitude and longitude must be given together (or both left empty).
const geolocationValidator: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const latitude = group.get('latitude')?.value;
  const longitude = group.get('longitude')?.value;
  const hasLatitude = latitude !== null && latitude !== '';
  const hasLongitude = longitude !== null && longitude !== '';

  return hasLatitude === hasLongitude ? null : { geolocation: true };
};

@Component({
  selector: 'combi-event-form',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    PageTitleComponent,
    ReactiveFormsModule,
  ],
  template: `
    <combi-page-title [selfHandle]="false" (goBack)="goBack()">
      {{ isEdit ? 'Editar evento' : 'Crear evento' }}
    </combi-page-title>

    <form class="event-form" [formGroup]="form" (ngSubmit)="save()">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Información general</mat-card-title>
        </mat-card-header>
        <mat-card-content class="event-form__fields">
          <mat-form-field>
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name" maxlength="120" required />
            @if (form.controls.name.hasError('required')) {
              <mat-error>El nombre es obligatorio</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Identificador (URL)</mat-label>
            <span matTextPrefix>/</span>
            <input matInput formControlName="id" required />
            @if (isEdit) {
              <mat-hint>El identificador no se puede cambiar.</mat-hint>
            } @else {
              <mat-hint>
                Solo minúsculas, números y guiones. Ej: ng-meetup-ago-26
              </mat-hint>
            }
            @if (form.controls.id.hasError('required')) {
              <mat-error>El identificador es obligatorio</mat-error>
            } @else if (form.controls.id.hasError('pattern')) {
              <mat-error>Usa solo minúsculas, números y guiones</mat-error>
            } @else if (form.controls.id.hasError('reserved')) {
              <mat-error>Este identificador está reservado</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Descripción corta</mat-label>
            <textarea
              matInput
              formControlName="shortDescription"
              maxlength="300"
              rows="2"
              required
            ></textarea>
            <mat-hint align="end">
              {{ form.controls.shortDescription.value.length }} / 300
            </mat-hint>
            @if (form.controls.shortDescription.hasError('required')) {
              <mat-error>La descripción corta es obligatoria</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Descripción</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="8"
              required
            ></textarea>
            <mat-hint>Admite HTML (p, b, br, ul, li…)</mat-hint>
            @if (form.controls.description.hasError('required')) {
              <mat-error>La descripción es obligatoria</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Información adicional del registro</mat-label>
            <textarea
              matInput
              formControlName="additionalRegistrationInfo"
              rows="2"
            ></textarea>
            <mat-hint>Se muestra junto al código QR del participante.</mat-hint>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Imágenes</mat-card-title>
        </mat-card-header>
        <mat-card-content class="event-form__fields">
          <div class="event-form__image-field">
            <div class="event-form__upload-row">
              <mat-form-field>
                <mat-label>Imagen (URL)</mat-label>
                <input matInput type="url" formControlName="image" required />
                <mat-hint
                  >Imagen cuadrada para tarjetas y redes sociales. Súbela o pega
                  una URL.</mat-hint
                >
                @if (form.controls.image.hasError('required')) {
                  <mat-error>La imagen es obligatoria</mat-error>
                }
              </mat-form-field>
              <input
                #imageFile
                type="file"
                accept="image/*"
                hidden
                (change)="uploadImage('image', imageFile)"
              />
              <button
                mat-stroked-button
                type="button"
                class="event-form__upload-button"
                [disabled]="uploadProgress().image !== null"
                (click)="imageFile.click()"
              >
                <mat-icon aria-hidden="true" fontIcon="upload" />
                Subir imagen
              </button>
            </div>
            @if (uploadProgress().image; as progress) {
              <mat-progress-bar
                mode="determinate"
                [value]="progress"
                aria-label="Progreso de subida"
              />
            } @else if (uploadProgress().image === 0) {
              <mat-progress-bar mode="indeterminate" aria-label="Subiendo" />
            }
            @if (form.controls.image.valid) {
              <img
                class="event-form__preview event-form__preview--square"
                alt="Vista previa la imagen"
                [src]="form.controls.image.value"
              />
            }
          </div>
          <div class="event-form__image-field">
            <div class="event-form__upload-row">
              <mat-form-field>
                <mat-label>Banner (URL)</mat-label>
                <input
                  matInput
                  type="url"
                  formControlName="bannerImage"
                  required
                />
                <mat-hint
                  >Imagen horizontal (3:1) de la página del evento. Súbela o
                  pega una URL.</mat-hint
                >
                @if (form.controls.bannerImage.hasError('required')) {
                  <mat-error>El banner es obligatorio</mat-error>
                }
              </mat-form-field>
              <input
                #bannerFile
                type="file"
                accept="image/*"
                hidden
                (change)="uploadImage('banner', bannerFile)"
              />
              <button
                mat-stroked-button
                type="button"
                class="event-form__upload-button"
                [disabled]="uploadProgress().banner !== null"
                (click)="bannerFile.click()"
              >
                <mat-icon aria-hidden="true" fontIcon="upload" />
                Subir banner
              </button>
            </div>
            @if (uploadProgress().banner; as progress) {
              <mat-progress-bar
                mode="determinate"
                [value]="progress"
                aria-label="Progreso de subida"
              />
            } @else if (uploadProgress().banner === 0) {
              <mat-progress-bar mode="indeterminate" aria-label="Subiendo" />
            }
            @if (form.controls.bannerImage.valid) {
              <img
                class="event-form__preview event-form__preview--banner"
                alt="Vista previa del banner"
                [src]="form.controls.bannerImage.value"
              />
            }
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Fecha y lugar</mat-card-title>
        </mat-card-header>
        <mat-card-content class="event-form__fields">
          <div class="event-form__row">
            <mat-form-field>
              <mat-label>Inicio</mat-label>
              <input
                matInput
                type="datetime-local"
                formControlName="startDate"
                required
              />
              @if (form.controls.startDate.hasError('required')) {
                <mat-error>La fecha de inicio es obligatoria</mat-error>
              }
            </mat-form-field>
            <mat-form-field>
              <mat-label>Fin</mat-label>
              <input
                matInput
                type="datetime-local"
                formControlName="endDate"
                required
              />
              @if (form.controls.endDate.hasError('required')) {
                <mat-error>La fecha de fin es obligatoria</mat-error>
              }
            </mat-form-field>
          </div>
          @if (form.hasError('dateRange')) {
            <p class="event-form__error" role="alert">
              La fecha de fin debe ser posterior a la de inicio.
            </p>
          }

          <ng-container formGroupName="location">
            <mat-form-field>
              <mat-label>Lugar</mat-label>
              <input matInput formControlName="name" required />
              @if (form.controls.location.controls.name.hasError('required')) {
                <mat-error>El lugar es obligatorio</mat-error>
              }
            </mat-form-field>
            <div class="event-form__row">
              <mat-form-field>
                <mat-label>Latitud (opcional)</mat-label>
                <input
                  matInput
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  formControlName="latitude"
                />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Longitud (opcional)</mat-label>
                <input
                  matInput
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  formControlName="longitude"
                />
              </mat-form-field>
            </div>
            @if (form.controls.location.hasError('geolocation')) {
              <p class="event-form__error" role="alert">
                Ingresa latitud y longitud juntas, o deja ambas vacías.
              </p>
            }
          </ng-container>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Registro y precio</mat-card-title>
        </mat-card-header>
        <mat-card-content class="event-form__fields">
          <mat-form-field>
            <mat-label>Capacidad</mat-label>
            <input
              matInput
              type="number"
              min="1"
              formControlName="capacity"
              required
            />
            @if (form.controls.capacity.invalid) {
              <mat-error>Ingresa una capacidad mayor a 0</mat-error>
            }
          </mat-form-field>

          <ng-container formGroupName="price">
            <div class="event-form__row">
              <mat-form-field>
                <mat-label>Precio</mat-label>
                <input
                  matInput
                  type="number"
                  min="0"
                  step="any"
                  formControlName="amount"
                  required
                />
                <mat-hint>Usa 0 para eventos gratuitos.</mat-hint>
                @if (form.controls.price.controls.amount.invalid) {
                  <mat-error>Ingresa un precio válido</mat-error>
                }
              </mat-form-field>
              <mat-form-field>
                <mat-label>Moneda</mat-label>
                <mat-select formControlName="currency">
                  @for (currency of currencies; track currency) {
                    <mat-option [value]="currency">{{ currency }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Descuento</mat-label>
                <input
                  matInput
                  type="number"
                  min="0"
                  step="any"
                  formControlName="discount"
                />
                @if (form.controls.price.controls.discount.invalid) {
                  <mat-error>Ingresa un descuento válido</mat-error>
                }
              </mat-form-field>
            </div>
            <mat-form-field>
              <mat-label>Descripción del precio</mat-label>
              <input matInput formControlName="description" />
              <mat-hint>Ej: Registro general, Entrada libre…</mat-hint>
            </mat-form-field>
          </ng-container>

          <div class="event-form__toggles">
            <mat-slide-toggle formControlName="openRegistration">
              Registro abierto
            </mat-slide-toggle>
            <mat-slide-toggle formControlName="listEvent">
              Mostrar en la lista pública de eventos
            </mat-slide-toggle>
            <mat-slide-toggle formControlName="hasMarketplace">
              Tiene marketplace
            </mat-slide-toggle>
            <mat-slide-toggle formControlName="openMarketplace">
              Marketplace abierto
            </mat-slide-toggle>
            <mat-slide-toggle formControlName="hasSessions">
              Tiene sesiones / talleres
            </mat-slide-toggle>
          </div>

          @if (form.controls.hasSessions.value) {
            <mat-form-field>
              <mat-label>Máximo de sesiones por participante</mat-label>
              <input
                matInput
                type="number"
                min="0"
                formControlName="maxSessionsPerUser"
              />
              @if (form.controls.maxSessionsPerUser.invalid) {
                <mat-error>Ingresa un número válido</mat-error>
              }
            </mat-form-field>
          }
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Co-administradores</mat-card-title>
        </mat-card-header>
        <mat-card-content class="event-form__fields">
          <mat-form-field>
            <mat-label>Correos de co-administradores</mat-label>
            <textarea matInput formControlName="admins" rows="3"></textarea>
            <mat-hint>
              Separados por coma o salto de línea. Pueden gestionar registros,
              pagos y escanear entradas, pero no editar el evento.
            </mat-hint>
            @if (form.controls.admins.hasError('emailList')) {
              <mat-error>Hay correos con formato inválido</mat-error>
            }
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <div class="event-form__actions">
        <button mat-stroked-button type="button" (click)="goBack()">
          Cancelar
        </button>
        <button
          mat-flat-button
          type="submit"
          [disabled]="loading() || uploading()"
        >
          <mat-icon aria-hidden="true" fontIcon="save" />
          {{ isEdit ? 'Guardar cambios' : 'Crear evento' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .event-form__fields {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 1rem;

      mat-form-field {
        width: 100%;
      }
    }

    .event-form__row {
      display: grid;
      gap: 0 1rem;
      grid-template-columns: 1fr;

      @media (min-width: 600px) {
        grid-auto-columns: 1fr;
        grid-auto-flow: column;
      }
    }

    .event-form__image-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .event-form__upload-row {
      align-items: flex-start;
      display: flex;
      flex-wrap: wrap;
      gap: 0 0.75rem;

      mat-form-field {
        flex: 1 1 280px;
      }
    }

    .event-form__upload-button {
      height: 56px;
    }

    .event-form__preview {
      border: 1px solid var(--ce-border);
      border-radius: var(--ce-radius-md);
      object-fit: cover;
    }

    .event-form__preview--square {
      aspect-ratio: 1;
      width: 160px;
    }

    .event-form__preview--banner {
      aspect-ratio: 3 / 1;
      width: 100%;
    }

    .event-form__toggles {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 0.5rem 0 1rem;
    }

    .event-form__error {
      color: var(--mat-form-field-error-text-color, #b3261e);
      font-size: 0.75rem;
      margin: -0.5rem 0 0.5rem;
    }

    .event-form__actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding-bottom: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventFormComponent implements OnInit {
  readonly #auth = inject(AuthService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #eventsService = inject(EventsService);
  readonly #eventState = inject(EventState);
  readonly #fb = inject(FormBuilder);
  readonly #logger = inject(LoggerService);
  readonly #router = inject(Router);

  readonly isEdit = inject(ActivatedRoute).snapshot.data['mode'] === 'edit';
  readonly loading = inject(LoadingState).loading;
  readonly currencies = ['BOB', 'USD'];
  // Upload percentage per image; null when nothing is uploading.
  readonly uploadProgress = signal<Record<EventImageKind, number | null>>({
    image: null,
    banner: null,
  });
  readonly uploading = computed(() =>
    Object.values(this.uploadProgress()).some((progress) => progress !== null),
  );

  readonly form = this.#fb.nonNullable.group(
    {
      id: [
        '',
        [
          Validators.required,
          Validators.pattern(SLUG_PATTERN),
          reservedIdValidator,
        ],
      ],
      name: ['', [Validators.required, Validators.maxLength(120)]],
      shortDescription: ['', [Validators.required, Validators.maxLength(300)]],
      description: ['', Validators.required],
      additionalRegistrationInfo: [''],
      image: ['', Validators.required],
      bannerImage: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      location: this.#buildLocationGroup(),
      capacity: [
        100,
        [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
      ],
      price: this.#fb.nonNullable.group({
        amount: [0, [Validators.required, Validators.min(0)]],
        currency: ['BOB', Validators.required],
        discount: [0, [Validators.required, Validators.min(0)]],
        description: [''],
      }),
      openRegistration: [false],
      listEvent: [false],
      hasMarketplace: [false],
      openMarketplace: [false],
      hasSessions: [false],
      maxSessionsPerUser: [0, [Validators.required, Validators.min(0)]],
      admins: ['', emailListValidator],
    },
    { validators: dateRangeValidator },
  );

  readonly #user = toSignal(this.#auth.user$);

  ngOnInit(): void {
    const event = this.#eventState.event();

    if (this.isEdit && event) {
      this.#patchForm(event);
      this.form.controls.id.disable();
    } else {
      this.#suggestIdFromName();
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.#logger.handleError('Revisa los campos marcados en el formulario');

      return;
    }

    const data = this.#toEventFormData();

    if (this.isEdit) {
      const eventId = this.#eventState.event()!.id;

      this.#eventsService
        .updateEvent(eventId, data)
        .pipe(filter(Boolean))
        .subscribe(() => {
          clearEventSeoCache(eventId);
          this.#logger.handleInfo('Evento actualizado');
          this.#router.navigate(['/admin']);
        });

      return;
    }

    const owner = this.#user()?.email;

    if (!owner) {
      this.#logger.handleError('Tu cuenta no tiene un correo asociado');

      return;
    }

    this.#eventsService
      .createEvent(this.form.controls.id.value, data, owner)
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.#logger.handleInfo('Evento creado');
        this.#router.navigate(['/admin']);
      });
  }

  uploadImage(kind: EventImageKind, input: HTMLInputElement): void {
    const file = input.files?.[0];

    // Reset so picking the same file again still triggers (change).
    input.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.#logger.handleError('El archivo debe ser una imagen');

      return;
    }

    if (file.size > EVENT_IMAGE_MAX_BYTES) {
      this.#logger.handleError('La imagen no puede pesar más de 5 MB');

      return;
    }

    const idControl = this.form.controls.id;

    // Images are stored under the event id, so it must be valid first.
    if (!this.isEdit && idControl.invalid) {
      idControl.markAsTouched();
      this.#logger.handleError(
        'Define un identificador válido antes de subir imágenes',
      );

      return;
    }

    const control =
      kind === 'image'
        ? this.form.controls.image
        : this.form.controls.bannerImage;

    this.#setUploadProgress(kind, 0);
    this.#eventsService
      .uploadEventImage(idControl.value, kind, file)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: ({ progress, url }) => {
          this.#setUploadProgress(kind, progress);

          if (url) {
            control.setValue(url);
            control.markAsDirty();
          }
        },
        error: (error) => {
          this.#setUploadProgress(kind, null);
          this.#logger.handleError(
            error?.code === 'storage/unauthorized'
              ? 'No tienes permiso para subir imágenes a este evento'
              : 'No se pudo subir la imagen. Inténtalo de nuevo.',
          );
          console.error(error);
        },
        complete: () => this.#setUploadProgress(kind, null),
      });
  }

  goBack(): void {
    this.#router.navigate(['/admin']);
  }

  #setUploadProgress(kind: EventImageKind, progress: number | null): void {
    this.uploadProgress.update((current) => ({ ...current, [kind]: progress }));
  }

  #buildLocationGroup() {
    return this.#fb.group(
      {
        name: this.#fb.nonNullable.control('', Validators.required),
        latitude: [
          null as number | null,
          [Validators.min(-90), Validators.max(90)],
        ],
        longitude: [
          null as number | null,
          [Validators.min(-180), Validators.max(180)],
        ],
      },
      { validators: geolocationValidator },
    );
  }

  #patchForm(event: AppEvent): void {
    this.form.patchValue({
      id: event.id,
      name: event.name,
      shortDescription: event.shortDescription,
      description: event.description,
      additionalRegistrationInfo: event.additionalRegistrationInfo ?? '',
      image: event.image,
      bannerImage: event.bannerImage,
      startDate: toDateTimeLocal(event.date.start.toDate()),
      endDate: toDateTimeLocal(event.date.end.toDate()),
      location: {
        name: event.location.name,
        latitude: event.location.geolocation?.latitude ?? null,
        longitude: event.location.geolocation?.longitude ?? null,
      },
      capacity: event.capacity,
      price: {
        amount: event.price.amount,
        currency: event.price.currency,
        discount: event.price.discount,
        description: event.price.description,
      },
      openRegistration: event.openRegistration,
      listEvent: event.listEvent,
      hasMarketplace: event.hasMarketplace,
      openMarketplace: event.openMarketplace,
      hasSessions: event.hasSessions,
      maxSessionsPerUser: event.maxSessionsPerUser ?? 0,
      admins: (event.admins ?? []).join('\n'),
    });

    if (!this.currencies.includes(event.price.currency)) {
      this.currencies.push(event.price.currency);
    }
  }

  // While creating, keep the id in sync with the name until the user edits
  // the id by hand.
  #suggestIdFromName(): void {
    const idControl = this.form.controls.id;

    this.form.controls.name.valueChanges
      .pipe(
        startWith(this.form.controls.name.value),
        map(slugify),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((slug) => {
        if (!idControl.dirty) {
          idControl.setValue(slug);
        }
      });
  }

  #toEventFormData(): EventFormData {
    const value = this.form.getRawValue();
    const { latitude, longitude, name: locationName } = value.location;
    const hasGeolocation =
      latitude !== null &&
      longitude !== null &&
      `${latitude}` !== '' &&
      `${longitude}` !== '';

    return {
      additionalRegistrationInfo: value.additionalRegistrationInfo.trim(),
      admins: [...new Set(parseEmails(value.admins))],
      bannerImage: value.bannerImage.trim(),
      capacity: Number(value.capacity),
      description: value.description.trim(),
      endDate: new Date(value.endDate),
      hasMarketplace: value.hasMarketplace,
      hasSessions: value.hasSessions,
      image: value.image.trim(),
      listEvent: value.listEvent,
      location: {
        name: (locationName ?? '').trim(),
        geolocation: hasGeolocation
          ? { latitude: Number(latitude), longitude: Number(longitude) }
          : null,
      },
      maxSessionsPerUser: Number(value.maxSessionsPerUser),
      name: value.name.trim(),
      openMarketplace: value.openMarketplace,
      openRegistration: value.openRegistration,
      price: {
        amount: Number(value.price.amount),
        currency: value.price.currency,
        description: value.price.description.trim(),
        discount: Number(value.price.discount),
      },
      shortDescription: value.shortDescription.trim(),
      startDate: new Date(value.startDate),
    };
  }
}

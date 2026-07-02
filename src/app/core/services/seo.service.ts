import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_NAME = 'Combieventos';
const SITE_URL = 'https://events.combimauri.com';
const DEFAULT_TITLE = 'Combieventos';
const DEFAULT_DESCRIPTION =
  'Encuentra y participa en los eventos de tecnología que más te interesan.';
const DEFAULT_IMAGE = `${SITE_URL}/logo.jpeg`;

export interface EventSeoData {
  name: string;
  shortDescription: string;
  image: string;
  path: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  readonly #document = inject(DOCUMENT);
  readonly #meta = inject(Meta);
  readonly #title = inject(Title);

  setEventTags(event: EventSeoData): void {
    const description = event.shortDescription || DEFAULT_DESCRIPTION;

    this.#setTags({
      title: `${event.name} | ${SITE_NAME}`,
      description,
      image: event.image || DEFAULT_IMAGE,
      url: `${SITE_URL}${event.path}`,
    });
  }

  resetTags(): void {
    this.#setTags({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_IMAGE,
      // Trailing slash to match the static canonical in index.html — the
      // same page must not alternate between two canonical forms.
      url: `${SITE_URL}/`,
    });
  }

  #setTags(tags: {
    title: string;
    description: string;
    image: string;
    url: string;
  }): void {
    this.#title.setTitle(tags.title);

    this.#meta.updateTag({ name: 'description', content: tags.description });
    this.#meta.updateTag({ property: 'og:title', content: tags.title });
    this.#meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.#meta.updateTag({
      property: 'og:description',
      content: tags.description,
    });
    this.#meta.updateTag({ property: 'og:image', content: tags.image });
    this.#meta.updateTag({ property: 'og:url', content: tags.url });
    this.#meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.#meta.updateTag({ name: 'twitter:title', content: tags.title });
    this.#meta.updateTag({
      name: 'twitter:description',
      content: tags.description,
    });
    this.#meta.updateTag({ name: 'twitter:image', content: tags.image });

    this.#setCanonicalLink(tags.url);
  }

  #setCanonicalLink(url: string): void {
    let link = this.#document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

    if (!link) {
      link = this.#document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.#document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}

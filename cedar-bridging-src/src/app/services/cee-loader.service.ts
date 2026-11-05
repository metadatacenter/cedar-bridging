import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Load the standalone editor only when a route or preview needs it. */
@Injectable({ providedIn: 'root' })
export class CeeLoader {
  private readonly document = inject(DOCUMENT);
  private pending?: Promise<void>;

  load(): Promise<void> {
    if (customElements.get('cedar-embeddable-editor')) return Promise.resolve();
    return (this.pending ||= new Promise<void>((resolve, reject) => {
      const script = this.document.createElement('script');
      const timer = setTimeout(() => fail(), 30000);
      const detach = () => {
        clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
      };
      const fail = () => {
        detach();
        script.remove();
        this.pending = undefined;
        reject(new Error('The editor could not be loaded.'));
      };
      script.src = new URL('node_modules/cedar-embeddable-editor/cedar-embeddable-editor.host-fonts.js', this.document.baseURI).href;
      script.onerror = fail;
      script.onload = () => {
        if (!customElements.get('cedar-embeddable-editor')) return fail();
        detach();
        resolve();
      };
      this.document.head.append(script);
    }));
  }
}

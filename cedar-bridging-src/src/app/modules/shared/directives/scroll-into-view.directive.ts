import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Scrolls its element into view once it is first drawn. A notice that appears below the window's
 * edge is brought up just far enough to show it whole.
 */
@Directive({ selector: '[appScrollIntoView]', standalone: true })
export class ScrollIntoViewDirective {
  constructor() {
    const element: HTMLElement = inject(ElementRef).nativeElement;
    afterNextRender(() => element.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
  }
}

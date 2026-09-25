import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({ selector: 'app-site-header', changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './site-header.html', styleUrl: './site-header.scss' })
export class SiteHeader {
  readonly businessName = input.required<string>();
  readonly itemCount = input.required<number>();
  readonly openCart = output<void>();
  readonly viewDrinks = output<void>();
}

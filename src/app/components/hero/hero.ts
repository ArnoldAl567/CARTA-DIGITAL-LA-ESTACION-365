import { ChangeDetectionStrategy, Component, output } from '@angular/core';
@Component({ selector: 'app-hero', changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './hero.html', styleUrl: './hero.scss' })
export class Hero { readonly viewMenu = output<void>(); }

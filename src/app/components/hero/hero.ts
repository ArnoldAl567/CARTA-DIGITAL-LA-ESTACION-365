import { ChangeDetectionStrategy, Component } from '@angular/core';
@Component({ selector: 'app-hero', changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './hero.html', styleUrl: './hero.scss' })
export class Hero {}

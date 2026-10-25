import { Component } from '@angular/core';
import { App } from './app';
import { AdminPanel } from './components/admin-panel/admin-panel';

@Component({
  selector: 'app-root',
  imports: [App, AdminPanel],
  template: `
    @if (isAdminRoute) { <app-admin-panel /> }
    @else { <app-menu /> }
  `,
})
export class AppShell {
  readonly isAdminRoute = window.location.pathname.replace(/\/$/, '') === '/panel-administrativo';
}

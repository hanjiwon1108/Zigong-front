import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { BottomNav } from './widgets/bottom-nav/bottom-nav';
import { ThemeService } from './shared/model/theme.service';
import { HelpTourService } from './shared/help-tour/help-tour.service';
import { HelpTourOverlay } from './shared/help-tour/help-tour-overlay';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, BottomNav, HelpTourOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly theme = inject(ThemeService);
  readonly helpTour = inject(HelpTourService);
  readonly router = inject(Router);
}

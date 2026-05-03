import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { BottomNav } from './widgets/bottom-nav/bottom-nav';
import { ThemeService } from './shared/model/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, BottomNav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly theme = inject(ThemeService);
}

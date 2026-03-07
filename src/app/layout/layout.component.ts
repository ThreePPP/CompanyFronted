import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { JwtService } from '../Service/jwt.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  constructor(private jwtService: JwtService, private router: Router) {}

  logout(): void {
    this.jwtService.removeToken();
    this.router.navigate(['/login']);
  }
}

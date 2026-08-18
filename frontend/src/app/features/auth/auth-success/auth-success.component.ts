import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-success',
  standalone: true,
  template: `<p style="text-align: center; margin-top: 2rem;">جاري تسجيل الدخول عبر Google...</p>`
})
export class AuthSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('accessToken', token);
        this.authService.isAuthenticated.set(true);
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}

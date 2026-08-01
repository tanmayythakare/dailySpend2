import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  isCollapsed  = false;
  isMobileOpen = false;
  pageTitle    = 'Dashboard';
  username     = '';
  activeTheme  = 'system';

  private routeTitles: { [key: string]: string } = {
    '/dashboard':        'Dashboard',
    '/transactions':     'Transactions',
    '/transactions/new': 'New Transaction',
    '/people':           'People',
    '/reports':          'Reports',
    '/accounts':         'Accounts',
    '/split':            'Split Bill',
    '/schedules':        'Recurring Schedules',
    '/settings':         'Settings'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.getUsername();
    this.themeService.activeTheme$.subscribe(theme => this.activeTheme = theme);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updatePageTitle(event.url);
        this.closeMobileSidebar();
      });
    this.updatePageTitle(this.router.url);
    this.checkScreenSize();
  }

  private getUsername(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload.sub || payload.username || '';
      } catch {
        this.username = '';
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void { this.checkScreenSize(); }

  private checkScreenSize(): void {
    if (window.innerWidth <= 1024) {
      this.isCollapsed = false;
      this.isMobileOpen = false;
    }
  }

  private updatePageTitle(url: string): void {
    if (this.routeTitles[url]) { this.pageTitle = this.routeTitles[url]; return; }
    const baseRoute = '/' + url.split('/')[1];
    if (this.routeTitles[baseRoute]) { this.pageTitle = this.routeTitles[baseRoute]; return; }
    this.pageTitle = 'DailySpend';
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 1024) this.isMobileOpen = !this.isMobileOpen;
    else this.isCollapsed = !this.isCollapsed;
  }

  closeMobileSidebar(): void { this.isMobileOpen = false; }

  toggleTheme(): void {
    this.themeService.toggleLightDark();
  }

  // authService.logout() already navigates to /login — don't call router.navigate again
  logout(): void { this.authService.logout(); }
}
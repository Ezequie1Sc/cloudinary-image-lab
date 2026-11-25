import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer';
import { HeaderComponent } from '../../shared/components/header/header';
import { ToastContainerComponent } from '../../shared/components/toast/toast';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'cil-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, TranslatePipe],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {}

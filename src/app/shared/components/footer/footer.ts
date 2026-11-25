import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideExternalLink } from '@lucide/angular';
import { EXTERNAL_LINKS } from '../../../core/constants/external-links.constant';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'cil-footer',
  standalone: true,
  imports: [LucideExternalLink, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly externalLinks = EXTERNAL_LINKS;
  protected readonly developerName = 'Orlando Ezequiel Salazar Cruz';
}

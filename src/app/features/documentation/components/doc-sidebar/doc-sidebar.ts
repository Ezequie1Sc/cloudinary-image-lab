import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export interface DocSectionItem {
  readonly id: string;
  readonly key: string;
}

@Component({
  selector: 'cil-doc-sidebar',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './doc-sidebar.html',
  styleUrl: './doc-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocSidebarComponent {
  readonly sections = input.required<readonly DocSectionItem[]>();
}

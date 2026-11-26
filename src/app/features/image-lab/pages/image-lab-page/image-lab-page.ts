import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import { CodePlaygroundComponent } from '../../components/code-playground/code-playground';
import { ImageComparatorComponent } from '../../components/image-comparator/image-comparator';
import { ImageGalleryComponent } from '../../components/image-gallery/image-gallery';
import { OptimizationMetricsComponent } from '../../components/optimization-metrics/optimization-metrics';
import { ResponsivePreviewComponent } from '../../components/responsive-preview/responsive-preview';
import { TransformationControlsComponent } from '../../components/transformation-controls/transformation-controls';
import { UrlPreviewComponent } from '../../components/url-preview/url-preview';

import { ImageLabStore } from '../../state/image-lab.store';

type WorkbenchTab = 'code' | 'url' | 'responsive';

@Component({
  selector: 'cil-image-lab-page',
  standalone: true,
  imports: [
    TranslatePipe,
    ImageComparatorComponent,
    ImageGalleryComponent,
    OptimizationMetricsComponent,
    TransformationControlsComponent,
    UrlPreviewComponent,
    CodePlaygroundComponent,
    ResponsivePreviewComponent,
  ],
  providers: [ImageLabStore],
  templateUrl: './image-lab-page.html',
  styleUrl: './image-lab-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLabPageComponent {
  protected readonly store = inject(ImageLabStore);

  protected readonly activeTab =
    signal<WorkbenchTab>('code');

  protected readonly tabs: readonly {
    id: WorkbenchTab;
    label: string;
  }[] = [
    {
      id: 'code',
      label: 'codePlayground.heading',
    },
    {
      id: 'url',
      label: 'workbench.deliveryUrl',
    },
    {
      id: 'responsive',
      label: 'workbench.responsivePreview',
    },
  ];

  protected selectTab(tab: WorkbenchTab): void {
    this.activeTab.set(tab);
  }
}
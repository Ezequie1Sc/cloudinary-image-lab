import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { LucideExternalLink } from '@lucide/angular';

import { EXTERNAL_LINKS } from '../../../../core/constants/external-links.constant';

import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import {
  DocSidebarComponent,
  type DocSectionItem,
} from '../../components/doc-sidebar/doc-sidebar';

import { DocCodeBlockComponent } from '../../components/doc-code-block/doc-code-block';

import { DeliveryPipelineComponent } from '../../components/delivery-pipeline/delivery-pipeline';

@Component({
  selector: 'cil-documentation-page',
  standalone: true,
  imports: [
    LucideExternalLink,
    TranslatePipe,
    DocSidebarComponent,
    DocCodeBlockComponent,
    DeliveryPipelineComponent,
  ],
  templateUrl: './documentation-page.html',
  styleUrl: './documentation-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationPageComponent {
  protected readonly externalLinks = EXTERNAL_LINKS;

  protected readonly sections: readonly DocSectionItem[] = [
    { id: 'what-is-cloudinary', key: 'whatIsCloudinary' },
    { id: 'why-optimization', key: 'whyOptimization' },
    { id: 'angular-integration', key: 'angularIntegration' },
    { id: 'f-auto', key: 'fAuto' },
    { id: 'q-auto', key: 'qAuto' },
    { id: 'modern-formats', key: 'modernFormats' },
    { id: 'resizing', key: 'resizing' },
    { id: 'responsive', key: 'responsive' },
    { id: 'metrics', key: 'metrics' },
    { id: 'using-lab', key: 'usingLab' },
    { id: 'cloud-name', key: 'cloudName' },
    { id: 'security', key: 'security' },
    { id: 'performance', key: 'performance' },
  ];

  protected readonly installSnippet =
    'pnpm add @cloudinary/url-gen @cloudinary/ng';

  protected readonly angularSetupSnippet = `import { Cloudinary } from '@cloudinary/url-gen';
import { limitFit } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'demo',
  },
});

const image = cld
  .image('sample')
  .resize(limitFit().width(800))
  .delivery(quality(autoQuality()))
  .delivery(format(autoFormat()));

const deliveryUrl = image.toURL();`;

  protected readonly responsiveSnippet = `<img
  src="https://res.cloudinary.com/demo/image/upload/c_limit,w_800/q_auto/f_auto/sample"
  srcset="
    https://res.cloudinary.com/demo/image/upload/c_limit,w_320/q_auto/f_auto/sample 320w,
    https://res.cloudinary.com/demo/image/upload/c_limit,w_640/q_auto/f_auto/sample 640w,
    https://res.cloudinary.com/demo/image/upload/c_limit,w_1280/q_auto/f_auto/sample 1280w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
  width="800"
  height="533"
  loading="lazy"
  decoding="async"
  alt="Optimized Cloudinary sample"
/>`;
}
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../../core/services/language.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { DemoImageAsset, ImageCategory } from '../../models/image.model';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'cil-image-gallery',
  standalone: true,
  imports: [TranslatePipe, EmptyStateComponent],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent {
  private readonly cloudinary = inject(CloudinaryService);
  protected readonly languageService = inject(LanguageService);

  readonly assets = input.required<readonly DemoImageAsset[]>();
  readonly selectedImageId = input.required<string>();
  readonly activeCategory = input.required<ImageCategory | 'all'>();

  readonly categoryChange = output<ImageCategory | 'all'>();
  readonly imageSelect = output<DemoImageAsset>();

  protected readonly categories: readonly (ImageCategory | 'all')[] = [
    'all',
    'nature',
    'architecture',
    'portrait',
    'products',
    'urban',
  ];

  protected getThumbnailUrl(publicId: string): string {
    return this.cloudinary.buildThumbnailUrl(publicId, 240, 160);
  }

  protected getAssetTitle(asset: DemoImageAsset): string {
    return asset.title[this.languageService.language()];
  }

  protected getAssetAlt(asset: DemoImageAsset): string {
    return asset.alt[this.languageService.language()];
  }
}

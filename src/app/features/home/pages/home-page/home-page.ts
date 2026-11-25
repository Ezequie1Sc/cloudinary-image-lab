import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EducationalSectionComponent } from '../../components/educational-section/educational-section';
import { FeaturesSectionComponent } from '../../components/features-section/features-section';
import { HeroComponent } from '../../components/hero/hero';

@Component({
  selector: 'cil-home-page',
  standalone: true,
  imports: [HeroComponent, FeaturesSectionComponent, EducationalSectionComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}

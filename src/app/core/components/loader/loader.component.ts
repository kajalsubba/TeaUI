// loader.component.ts
import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  loading$ = this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {}
}

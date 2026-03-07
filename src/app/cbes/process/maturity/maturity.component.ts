import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-maturity',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './maturity.component.html',
  styles: ``
})
export class MaturityComponent implements OnInit {
  cbeId: number = 0;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.cbeId = Number(this.route.snapshot.paramMap.get('id'));
  }
}

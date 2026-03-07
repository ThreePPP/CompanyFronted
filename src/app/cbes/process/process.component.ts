import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcessService } from '../../Service/Process.service';

interface Cbe {
  id: number;
  name: string;
  thaiName?: string;
  abbreviation?: string;
  status: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: any;
}

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './process.component.html',
  styles: ``
})
export class ProcessComponent implements OnInit {
  searchText = '';
  filterText = '';

  cbesList: Cbe[] = [];

  constructor(private processService: ProcessService) {}

  ngOnInit(): void {
    this.loadCBEs();
  }

  loadCBEs(): void {
    this.processService.GetAllCBEs().subscribe({
      next: (res: ApiResponse) => {
        if (res.code === 200) {
          this.cbesList = res.data;
        }
      },
      error: (err: any) => {
        console.error('Error fetching CBEs:', err);
      }
    });
  }

  get filteredList(): Cbe[] {
    if (!this.filterText.trim()) return this.cbesList;
    return this.cbesList.filter(c => {
      const topic = this.formatTopic(c);
      return topic.toLowerCase().includes(this.filterText.toLowerCase());
    });
  }

  onSearch(): void {
    this.filterText = this.searchText;
  }

  onSearchChange(value: string): void {
    // ผู้ใช้ต้องการให้กดปุ่มค้นหาเท่านั้น ถึงแม้จะลบ text จนหมด
  }

  formatTopic(item: Cbe): string {
    const th = item.thaiName || '';
    const en = item.name || '';
    const abbr = item.abbreviation || '';

    let inner = '';
    if (en && abbr) {
      inner = `${en} : ${abbr}`;
    } else if (en) {
      inner = en;
    } else if (abbr) {
      inner = abbr;
    }

    if (th && inner) {
      return `${th} (${inner})`;
    } else if (th) {
      return th;
    } else {
      return inner;
    }
  }

  trashItem(id: number): void {
    if (!confirm('ต้องการลบข้อมูลหรือไม่?')) return;
    this.processService.TrashCBE(id).subscribe({
      next: () => this.loadCBEs(),
      error: (err: any) => console.error('Error trashing CBE:', err)
    });
  }
}

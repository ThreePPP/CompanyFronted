import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProcessService } from '../../../Service/Process.service';

interface Cbe {
  id: number;
  name: string;
  thaiName?: string;
  abbreviation?: string;
  updateDate?: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: any;
}

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './trash.component.html',
  styles: ``
})
export class TrashComponent implements OnInit {
  searchText = '';
  filterText = '';
  trashedList: Cbe[] = [];

  constructor(private processService: ProcessService) {}

  ngOnInit(): void {
    this.loadTrash();
  }

  loadTrash(): void {
    this.processService.GetAllTrashCBEs().subscribe({
      next: (res: ApiResponse) => {
        if (res.code === 200) {
          this.trashedList = res.data;
        }
      },
      error: (err: any) => console.error('Error fetching trash:', err)
    });
  }

  get filteredList(): Cbe[] {
    if (!this.filterText.trim()) return this.trashedList;
    return this.trashedList.filter(c => {
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

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }

  restoreItem(id: number): void {
    this.processService.RestoreCBE(id).subscribe({
      next: () => this.loadTrash(),
      error: (err: any) => console.error('Error restoring CBE:', err)
    });
  }

  deleteItem(id: number): void {
    if (!confirm('ต้องการลบข้อมูลถาวรหรือไม่?')) return;
    this.processService.DeleteCBE(id).subscribe({
      next: () => this.loadTrash(),
      error: (err: any) => console.error('Error deleting CBE:', err)
    });
  }
}

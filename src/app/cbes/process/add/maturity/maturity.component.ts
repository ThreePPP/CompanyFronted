import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessService } from '../../../../Service/Process.service';

interface SubTopicData {
  id: number;
  name: string;
  weight: number;
}

interface TopicData {
  id: number;
  name: string;
  weight: number;
  subTopics: SubTopicData[];
}

interface ProcessData {
  id: number;
  name: string;
  weight: number;
  topics: TopicData[];
}

interface CbeInfo {
  id: number;
  name: string;
  thaiName: string;
  abbreviation: string;
  round: number;
  note: string;
}

@Component({
  selector: 'app-add-maturity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maturity.component.html',
})
export class AddMaturityComponent implements OnInit {
  private readonly apiUrl = 'https://localhost:7176';

  cbeId = 0;
  cbe: CbeInfo | null = null;
  processes: ProcessData[] = [];
  loading = true;
  note = '';

  // maturityData[subTopicId][level 0-4] = description
  maturityData: { [subTopicId: number]: string[] } = {};

  readonly levels = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private processService: ProcessService,
  ) {}

  ngOnInit() {
    this.cbeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCbe();
  }

  loadCbe() {
    this.http
      .get<{ code: number; message: string; data: any }>(
        `${this.apiUrl}/Process/GetCBEsById/${this.cbeId}`,
      )
      .subscribe({
        next: (res) => {
          if (res.code === 200) {
            const { cbe, processes, topics } = res.data;
            this.cbe = {
              id: cbe.id,
              name: cbe.name ?? '',
              thaiName: cbe.thaiName ?? '',
              abbreviation: cbe.abbreviation ?? '',
              round: cbe.counter ?? 0,
              note: cbe.note ?? '',
            };
            this.note = this.cbe.note;

            // Build nested structure (same pattern as edit component)
            this.processes = (processes ?? []).map((p: any) => {
              const pTopics: TopicData[] = (topics ?? [])
                .filter((t: any) => t.headerId === p.id)
                .map((t: any) => ({
                  id: t.id,
                  name: t.name ?? '',
                  weight: t.weight ?? 0,
                  subTopics: (topics ?? [])
                    .filter((s: any) => s.headerId === t.id)
                    .map((s: any) => ({
                      id: s.id,
                      name: s.name ?? '',
                      weight: s.weight ?? 0,
                    })),
                }));
              return {
                id: p.id,
                name: p.name ?? '',
                weight: p.weight ?? 0,
                topics: pTopics,
              };
            });

            this.initMaturityData();
          }
          this.loading = false;
        },
        error: () => {
          alert('ไม่สามารถโหลดข้อมูลได้');
          this.loading = false;
        },
      });
  }

  initMaturityData() {
    for (const p of this.processes) {
      for (const t of p.topics) {
        for (const s of t.subTopics) {
          this.maturityData[s.id] = ['', '', '', '', ''];
        }
      }
    }
  }

  private buildMaturityList(): { processid: number; level: string; name: string }[] {
    const list: { processid: number; level: string; name: string }[] = [];
    for (const p of this.processes) {
      for (const t of p.topics) {
        for (const s of t.subTopics) {
          for (let i = 0; i < 5; i++) {
            list.push({ processid: s.id, level: (i + 1).toString(), name: this.maturityData[s.id][i] });
          }
        }
      }
    }
    return list;
  }

  private validate(): boolean {
    for (const p of this.processes) {
      for (const t of p.topics) {
        for (const s of t.subTopics) {
          const levels = this.maturityData[s.id] ?? [];
          for (let i = 0; i < 5; i++) {
            if (!levels[i]?.trim()) {
              alert(`กรุณากรอกระดับที่ ${i + 1} ของประเด็นย่อย "${s.name}"`);
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  save() {
    if (!this.validate()) return;
    if (!confirm('ต้องการบันทึกข้อมูลหรือไม่?')) return;

    const maturityList = this.buildMaturityList();
    this.processService.CreateMaturity(maturityList).subscribe({
      next: () => {
        const afterSave = () => this.router.navigate(['/cbes/process']);
        if (this.note.trim()) {
          this.processService.PatchCBENote(this.cbeId, this.note).subscribe({
            next: afterSave,
            error: afterSave,
          });
        } else {
          afterSave();
        }
      },
      error: () => alert('เกิดข้อผิดพลาดในการบันทึก'),
    });
  }

  saveAndGoToMaturity() {
    if (!this.validate()) return;
    if (!confirm('ต้องการบันทึกข้อมูลหรือไม่?')) return;

    const maturityList = this.buildMaturityList();
    this.processService.CreateMaturity(maturityList).subscribe({
      next: () => {
        const afterSave = () => this.router.navigate(['/cbes/process/maturity', this.cbeId]);
        if (this.note.trim()) {
          this.processService.PatchCBENote(this.cbeId, this.note).subscribe({
            next: afterSave,
            error: afterSave,
          });
        } else {
          afterSave();
        }
      },
      error: () => alert('เกิดข้อผิดพลาดในการบันทึก'),
    });
  }
}


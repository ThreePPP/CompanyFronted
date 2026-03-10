import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcessService } from '../../../Service/Process.service';

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
}

interface Department {
  id: number;
  name: string;
}

@Component({
  selector: 'app-maturity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maturity.component.html',
  styles: ``
})
export class MaturityComponent implements OnInit {
  private readonly apiUrl = 'https://localhost:7176';

  cbeId = 0;
  cbe: CbeInfo | null = null;
  departments: Department[] = [];
  processes: ProcessData[] = [];
  loading = true;
  note = '';

  supervisors: any[] = [];
  representatives: any[] = [];
  
  newSupervisorInput = '';
  supervisorInputOpen = false;
  newRepresentativeInput = '';
  representativeInputOpen = false;

  // maturityData[subTopicId][levelIndex 0-4] = description
  maturityData: { [subTopicId: number]: string[] } = {};
  // responsibleData key = `${subTopicId}_${levelIndex}` → saved items
  responsibleData: { [key: string]: any[] } = {};
  // new responsible input per cell
  newResponsibleInput: { [key: string]: string } = {};
  responsibleDropdownKey = '';

  readonly levels = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private processService: ProcessService,
  ) {}

  ngOnInit() {
    this.cbeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDepartments();
    this.loadCbe();
  }

  loadDepartments() {
    this.processService.GetDepartments().subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.departments = res.data.map((d: any) => ({
            id: d.id,
            name: d.name ?? ''
          }));
        }
      },
      error: (err: any) => console.error('Failed to load departments', err)
    });
  }

  getFilteredDepartments(keyword: string): Department[] {
    if (!keyword?.trim()) return this.departments;
    const kw = keyword.toLowerCase().trim();
    return this.departments.filter(d => d.name.toLowerCase().includes(kw));
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
            };
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
              return { id: p.id, name: p.name ?? '', weight: p.weight ?? 0, topics: pTopics };
            });
            this.initData();

            // Load existing maturity data to pre-fill the form
            this.processService.GetMaturityByCbeId(this.cbeId).subscribe({
              next: (mRes: any) => {
                if (mRes.code === 200) {
                  for (const m of mRes.data) {
                    const levelIndex = parseInt(m.level) - 1;
                    if (this.maturityData[m.processid] && levelIndex >= 0 && levelIndex < 5) {
                      this.maturityData[m.processid][levelIndex] = m.name ?? '';
                    }
                  }
                }
                this.loading = false;
              },
              error: () => { this.loading = false; },
            });
          } else {
            this.loading = false;
          }
        },
        error: () => {
          alert('ไม่สามารถโหลดข้อมูลได้');
          this.loading = false;
        },
      });
  }

  initData() {
    for (const p of this.processes) {
      for (const t of p.topics) {
        for (const s of t.subTopics) {
          this.maturityData[s.id] = ['', '', '', '', ''];
          for (let i = 0; i < 5; i++) {
            const key = `${s.id}_${i}`;
            this.responsibleData[key] = [];
            this.newResponsibleInput[key] = '';
          }
        }
      }
    }
  }

  rKey(subId: number, lvlIndex: number): string {
    return `${subId}_${lvlIndex}`;
  }

  addResponsible(subId: number, lvlIndex: number) {
    const key = this.rKey(subId, lvlIndex);
    const name = (this.newResponsibleInput[key] ?? '').trim();
    if (!name) return;
    // Call API to create/get department then add to list
    this.processService.CreateDepartment(name).subscribe({
      next: (res) => {
        if (res.code === 200 && res.data) {
          if (!this.responsibleData[key].find((r: any) => r.id === res.data.id)) {
            this.responsibleData[key].push({ id: res.data.id, name: res.data.name });
          }
          if (!this.departments.find(d => d.id === res.data.id)) {
            this.departments.push({ id: res.data.id, name: res.data.name });
          }
          this.newResponsibleInput[key] = '';
          this.responsibleDropdownKey = '';
        }
      },
      error: () => alert('บันทึกไม่สำเร็จ')
    });
  }

  removeResponsible(subId: number, lvlIndex: number, idx: number) {
    this.responsibleData[this.rKey(subId, lvlIndex)].splice(idx, 1);
  }

  addSupervisor() {
    const name = this.newSupervisorInput.trim();
    if (!name) return;
    this.processService.CreateDepartment(name).subscribe({
      next: (res) => {
        if (res.code === 200 && res.data) {
          if (!this.supervisors.find((s: any) => s.id === res.data.id)) {
            this.supervisors.push({ id: res.data.id, name: res.data.name });
          }
          if (!this.departments.find(d => d.id === res.data.id)) {
            this.departments.push({ id: res.data.id, name: res.data.name });
          }
          this.newSupervisorInput = '';
          this.supervisorInputOpen = false;
        }
      },
      error: () => alert('บันทึกไม่สำเร็จ')
    });
  }

  removeSupervisor(i: number) {
    this.supervisors.splice(i, 1);
  }

  addRepresentative() {
    const name = this.newRepresentativeInput.trim();
    if (!name) return;
    this.processService.CreateDepartment(name).subscribe({
      next: (res) => {
        if (res.code === 200 && res.data) {
          if (!this.representatives.find((r: any) => r.id === res.data.id)) {
            this.representatives.push({ id: res.data.id, name: res.data.name });
          }
          if (!this.departments.find(d => d.id === res.data.id)) {
            this.departments.push({ id: res.data.id, name: res.data.name });
          }
          this.newRepresentativeInput = '';
          this.representativeInputOpen = false;
        }
      },
      error: () => alert('บันทึกไม่สำเร็จ')
    });
  }

  removeRepresentative(i: number) {
    this.representatives.splice(i, 1);
  }

  closeDropdowns() {
    this.supervisorInputOpen = false;
    this.representativeInputOpen = false;
    this.responsibleDropdownKey = '';
  }

  hasOpenDropdown(): boolean {
    return this.supervisorInputOpen || this.representativeInputOpen || this.responsibleDropdownKey !== '';
  }

  validate(): boolean {
    if (!this.note.trim()) {
      alert('กรุณากรอกหมายเหตุในการบันทึก');
      return false;
    }
    return true;
  }

  async saveAndGoToEdit() {
    if (!this.validate()) return;
    if (!confirm('ต้องการบันทึกข้อมูลหรือไม่?')) return;

    await this.prepareAndSaveData();
    this.router.navigate(['/cbes/process/edit', this.cbeId]);
  }

  async save() {
    if (!this.validate()) return;
    if (!confirm('ต้องการบันทึกข้อมูลหรือไม่?')) return;

    await this.prepareAndSaveData();
    alert('บันทึกข้อมูลสำเร็จ');
    this.router.navigate(['/cbes/process']);
  }

  async prepareAndSaveData(): Promise<void> {
    // 1. Patch CBE Note
    await this.processService.PatchCBENote(this.cbeId, this.note).toPromise();

    // 2. Save Owners ("ผู้กำกับ", "ผู้แทน") 
    for (const s of this.supervisors) {
      if (s.id !== 0) {
        await this.processService.CreateOwner({ cbesId: this.cbeId, departmentId: s.id, type: 'ผู้กำกับ' }).toPromise().catch(() => {});
      }
    }
    for (const r of this.representatives) {
      if (r.id !== 0) {
        await this.processService.CreateOwner({ cbesId: this.cbeId, departmentId: r.id, type: 'ผู้แทน' }).toPromise().catch(() => {});
      }
    }

    // 3. Save Maturity
    const maturities: any[] = [];
    for (const subId in this.maturityData) {
      for (let i = 0; i < 5; i++) {
        maturities.push({
          processid: Number(subId),
          level: (i + 1).toString(),
          name: this.maturityData[subId][i] || ''
        });
      }
    }
    if (maturities.length > 0) {
      await this.processService.CreateMaturity(maturities).toPromise().catch(() => {});
    }
  }
}

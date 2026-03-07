import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ProcessService } from '../../../Service/Process.service';
import { SubTopic, Topic, ProcessItem } from '../../../Models/process.model';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit.component.html',
  styles: ``,
})
export class EditComponent implements OnInit {
  cbeId = 0;
  thaiTitle = '';
  englishTitle = '';
  abbreviation = '';
  round = 0;
  note = '';
  processes: ProcessItem[] = [];
  loading = true;

  constructor(
    private processService: ProcessService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.cbeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.processService.GetCBEById(this.cbeId).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          const { cbe, processes, topics } = res.data;
          this.thaiTitle = cbe.thaiName ?? '';
          this.englishTitle = cbe.name ?? '';
          this.abbreviation = cbe.abbreviation ?? '';
          this.round = (cbe.counter ?? 0);
          this.note = cbe.note ?? '';

          this.processes = processes.map((p: any) => {
            const pTopics = topics
              .filter((t: any) => t.headerId === p.id)
              .map((t: any) => ({
                name: t.name ?? '',
                weight: t.weight != null ? Number(t.weight) : null,
                subTopics: topics
                  .filter((s: any) => s.headerId === t.id)
                  .map((s: any) => ({
                    name: s.name ?? '',
                    weight: s.weight != null ? Number(s.weight) : null,
                  })),
              }));
            return {
              name: p.name ?? '',
              weight: p.weight ?? null,
              topics: pTopics,
            };
          });

          this.loading = false;
        }
      },
      error: (err: any) => {
        console.error('Error loading CBE:', err);
        this.loading = false;
      },
    });
  }

  get totalProcessWeight(): number {
    return this.processes.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  }

  topicWeightSum(pi: number): number {
    return this.processes[pi].topics.reduce(
      (sum, t) => sum + (t.weight ?? 0),
      0,
    );
  }

  subTopicWeightSum(pi: number, ti: number): number {
    return this.processes[pi].topics[ti].subTopics.reduce(
      (sum, s) => sum + (s.weight ?? 0),
      0,
    );
  }

  addProcess() {
    this.processes.push({ name: '', weight: null, topics: [] });
  }

  deleteProcess(pi: number) {
    this.processes.splice(pi, 1);
  }

  addTopic(pi: number) {
    this.processes[pi].topics.push({ name: '', weight: null, subTopics: [] });
  }

  deleteTopic(pi: number, ti: number) {
    this.processes[pi].topics.splice(ti, 1);
  }

  addSubTopic(pi: number, ti: number) {
    this.processes[pi].topics[ti].subTopics.push({ name: '', weight: null });
  }

  deleteSubTopic(pi: number, ti: number, si: number) {
    this.processes[pi].topics[ti].subTopics.splice(si, 1);
  }

  save() {
    const thaiRegex = /^[ก-๙\s]+$/;
    const englishRegex = /^[a-zA-Z\s]+$/;

    if (!this.thaiTitle.trim()) {
      alert('กรุณากรอกหัวข้อภาษาไทย');
      return;
    }
    if (!thaiRegex.test(this.thaiTitle.trim())) {
      alert('หัวข้อภาษาไทยต้องเป็นภาษาไทยเท่านั้น');
      return;
    }
    if (!this.englishTitle.trim()) {
      alert('กรุณากรอกหัวข้อภาษาอังกฤษ');
      return;
    }
    if (!englishRegex.test(this.englishTitle.trim())) {
      alert('หัวข้อภาษาอังกฤษต้องเป็นภาษาอังกฤษเท่านั้น');
      return;
    }
    if (!this.abbreviation.trim()) {
      alert('กรุณากรอกตัวย่อ');
      return;
    }
    if (!this.note.trim()) {
      alert('กรุณากรอกหมายเหตุในการแก้ไข');
      return;
    }

    if (!confirm('ต้องการบันทึกข้อมูลหรือไม่?')) return;

    const body = {
      thaiName: this.thaiTitle,
      name: this.englishTitle,
      abbreviation: this.abbreviation,
      note: this.note,
      processes: this.processes.map((p) => ({
        name: p.name,
        weight: p.weight ?? 0,
        topics: p.topics.map((t) => ({
          name: t.name,
          weight: t.weight ?? 0,
          subTopics: t.subTopics.map((s) => ({
            name: s.name,
            weight: s.weight ?? 0,
          })),
        })),
      })),
    };

    this.processService.UpdateCBE(this.cbeId, body).subscribe({
      next: () => {
        this.router.navigate(['/cbes/process']);
      },
      error: (err: any) => {
        alert(err.error?.message ?? 'เกิดข้อผิดพลาด');
      },
    });
  }
}

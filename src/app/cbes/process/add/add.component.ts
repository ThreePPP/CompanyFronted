import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SubTopic, Topic, ProcessItem } from '../../../Models/process.model';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add.component.html',
  styles: ``,
})
export class AddComponent {
  private readonly apiUrl = 'https://localhost:7176';

  thaiTitle = '';
  englishTitle = '';
  abbreviation = '';
  round = 0;
  note = '';
  processes: ProcessItem[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

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

  filterAbbreviation() {
    this.abbreviation = this.abbreviation.replace(/[^a-zA-Z]/g, '');
  }

  saveAndGoToMaturity() {
    const thaiRegex = /^[ก-๙\s]+$/;
    const englishRegex = /^[a-zA-Z\s]+$/;

    // 1. เช็คหัวข้อภาษาไทย
    if (!this.thaiTitle.trim()) {
      alert('กรุณากรอกหัวข้อภาษาไทย');
      return;
    } //test ส่งกลับมาเป็น true หรือ false
    if (!thaiRegex.test(this.thaiTitle.trim())) {
      alert('หัวข้อภาษาไทยต้องเป็นภาษาไทยเท่านั้น');
      return;
    }

    // 2. เช็คหัวข้อภาษาอังกฤษ
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
    const abbrevRegex = /^[a-zA-Z]+$/;
    if (!abbrevRegex.test(this.abbreviation)) {
      alert('ตัวย่อต้องเป็นภาษาอังกฤษเท่านั้น');
      return;
    }

    if (!confirm('ต้องการบันทึกข้อมูลหรือไม่?')) return;

    const body = {
      thaiName: this.thaiTitle,
      name: this.englishTitle,
      abbreviation: this.abbreviation,
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

    this.http
      .post<{
        code: number;
        message: string;
        data: number;
      }>(`${this.apiUrl}/Process/CreateCBEs`, body)
      .subscribe({
        next: (res) => {
          this.router.navigate(['/cbes/process/add/maturity', res.data], { replaceUrl: true });
        },
        error: (err) => {
          alert(err.error?.message ?? 'เกิดข้อผิดพลาด');
        },
      });
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
    const abbrevRegexSave = /^[a-zA-Z]+$/;
    if (!abbrevRegexSave.test(this.abbreviation)) {
      alert('ตัวย่อต้องเป็นภาษาอังกฤษเท่านั้น');
      return;
    }

    if (!confirm('ต้องการบันทึกข้อมูลหรือไม่?')) return;

    const body = {
      thaiName: this.thaiTitle,
      name: this.englishTitle,
      abbreviation: this.abbreviation,
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

    this.http
      .post<{
        code: number;
        message: string;
        data: number;
      }>(`${this.apiUrl}/Process/CreateCBEs`, body)
      .subscribe({
        next: () => {
          this.router.navigate(['/cbes/process']);
        },
        error: (err) => {
          alert(err.error?.message ?? 'เกิดข้อผิดพลาด');
        },
      });
  }
}

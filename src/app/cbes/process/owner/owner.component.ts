import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessService } from '../../../Service/Process.service';

interface Department {
  id: number;
  name: string;
}

interface Owner {
  id: number;
  departmentId: number;
  departmentName: string;
  type: string;
}

@Component({
  selector: 'app-owner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner.component.html',
  styles: ``
})
export class OwnerComponent implements OnInit {
  cbeId = 0;
  cbeName = '';
  cbeRound = 0;
  cbeNote = '';
  departments: Department[] = [];
  owners: Owner[] = [];
  selectedDepartmentId = 0;
  selectedType = 'ผู้รับผิดชอบหลัก';

  typeOptions: string[] = ['ผู้รับผิดชอบหลัก', 'ผู้รับผิดชอบรอง'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private processService: ProcessService
  ) {}

  ngOnInit(): void {
    this.cbeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCbe();
    this.loadDepartments();
    this.loadOwners();
  }

  loadCbe(): void {
    this.processService.GetCBEById(this.cbeId).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          const cbe = res.data.cbe;
          this.cbeName = cbe.thaiName || cbe.name || '';
          this.cbeRound = cbe.counter ?? 0;
          this.cbeNote = cbe.note ?? '';
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  loadDepartments(): void {
    this.processService.GetDepartments().subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.departments = res.data;
          if (this.departments.length > 0) {
            this.selectedDepartmentId = this.departments[0].id;
          }
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  loadOwners(): void {
    this.processService.GetOwnersByCbeId(this.cbeId).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.owners = res.data.map((o: any) => ({
            id: o.id,
            departmentId: o.departmentId,
            departmentName: o.departmentName ?? '',
            type: o.type ?? ''
          }));
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  addOwner(): void {
    if (this.selectedDepartmentId === 0) {
      alert('กรุณาเลือกหน่วยงาน');
      return;
    }

    const body = {
      cbesId: this.cbeId,
      departmentId: this.selectedDepartmentId,
      type: this.selectedType
    };

    this.processService.CreateOwner(body).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.loadOwners();
          alert('บันทึกสำเร็จ');
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  goBack(): void {
    this.router.navigate(['/cbes/process']);
  }
}

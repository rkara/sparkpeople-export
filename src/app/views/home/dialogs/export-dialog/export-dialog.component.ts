import { Component, OnInit } from '@angular/core';

export enum ExportState {
  Exporting = 1,
  Success = 2,
  Error = 3,
}

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements OnInit {
  exportState = ExportState.Exporting;

  constructor() {}

  ngOnInit(): void {}

  setSuccess() {
    this.exportState = ExportState.Success;
  }

  setError() {
    this.exportState = ExportState.Error;
  }
}

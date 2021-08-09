import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ExportService } from './services/export.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  userId = '';
  exporting = false;

  private subscriptions = new Subscription();

  constructor(
    private exportService: ExportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onDownloadButtonClick() {
    if (this.userId.trim().length > 0) {
      const userId = this.userId.trim();
      this.exporting = true;
      this.subscriptions.add(
        this.exportService.exportBlog$(userId).subscribe((pdfFile) => {
          if (pdfFile) {
            this.onSuccess(userId, pdfFile);
          } else {
            this.onError('Error exporting blog to PDF.');
          }
        })
      );
    }
  }

  private onError(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 5000,
      panelClass: 'home__snackbar--error',
    });
  }

  private onSuccess(blogName: string, pdfFile: any) {
    // TODO: Display success dialog
    // Create a link pointing to the ObjectURL containing the blob.
    const data = window.URL.createObjectURL(pdfFile);

    var link = document.createElement('a');
    link.href = data;
    link.download = `${blogName}-Export.pdf`;
    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
    );
  }
}

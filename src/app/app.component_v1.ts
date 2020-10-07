import { Component } from '@angular/core';
import { UploadService } from './upload.service';
import { map, expand } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

export class uploadFiles {
  constructor(public video: File, public path: string, public uploadURI: string) {
    this.video = video;
    this.path = path;
    this.uploadURI = uploadURI;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'vimeo-uploader';
  videoList: FileList;
  videoLinks = [];
  pendingFiles: uploadFiles[] = [];
  constructor(private upload: UploadService) { }

  public start(files: FileList) {
    this.videoList = files;
    console.log(this.videoList);
    const recursion = this.getLink(this.videoList[0], 0, this.videoList).pipe(expand(res => {
      return res.index > res.arr.length - 1 ?
        EMPTY : this.getLink(this.videoList[res.index], res.index, this.videoList);
    }));

    recursion.subscribe(x => {
      if (x.index > x.arr.length - 1) {
        console.log('Links generated, Starting upload');
        this.videoUpload();
      }
    });
  }

  getLink = (video: File, index, arr) => {
    console.log('index: ' + index);
    return this.upload.createVideo(video).pipe(
      map(response => {
        const videoFile = new uploadFiles(video, response.body.link, response.body.upload.upload_link);
        this.pendingFiles.push(videoFile);
        console.log('response: ' + response);
        return {
          data: response,
          index: index + 1,
          arr: arr
        };
      }),
    );
  }

  videoUpload() {
    const success = () => {
      console.log('after video upload section');
    };
    const upload: Array<any> = [];
    for (let i = 0; i < this.pendingFiles.length; i++) {
      upload.push(
        this.upload.tusUpload(
          this.pendingFiles[i],
          i,
          this.pendingFiles,
          upload,
          success
        ),
      );
    }
    console.log('start video upload sequentially');
    upload[0].start();
  }
}

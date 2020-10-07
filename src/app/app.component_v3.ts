import { Component } from '@angular/core';
import { UploadService } from './upload.service';
import { map, expand } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import * as tus from 'tus-js-client';


export class uploadFiles {
    name: string = '';
    type: string = '';
    constructor(public video: File, public path: string, public uploadURI: string) {
        this.video = video;
        this.path = path;
        this.uploadURI = uploadURI;
        this.name = video.name;
        this.type = video.type;
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
        var file = files[0];
        this.upload.createVideo(file).subscribe(response => {
            console.log(response);
            const videoFile = new uploadFiles(file, response.link, response.upload.upload_link);
            const fileUpload = this.upload.tusUpload(videoFile, this.success);
            // fileUpload.findPreviousUploads().then((previousUploads) => {
            //     console.log('Previous uploads');
            //     console.log(previousUploads);
            // });
            fileUpload.start();
        });

    }

    success = () => {
        console.log('after video upload section');
    };
}

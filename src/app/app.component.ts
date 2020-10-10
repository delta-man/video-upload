import { Component } from '@angular/core';
import { UploadService } from './upload.service';
import { map, expand } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import * as tus from 'tus-js-client';


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
        var file = files[0];
        this.upload.createVideo(file).subscribe(response => {
            console.log(response);
            const videoFile = new uploadFiles(file, response.link, response.upload.upload_link);
            const fileUpload = this.upload.tusUpload(videoFile, this.success);
            fileUpload.start();
        })

        // // Save and resume Section
        // let offSet = 0;
        // const key = `${file.name}.${file.size}`;
        // // Checking file details in localstorage
        // if (localStorage.getItem(key)) {
        //     console.log('File already in uploading status');
        //     const metaData = JSON.parse(localStorage.getItem(key));
        //     const { url } = metaData;
        //     this.upload.getStatus(url).subscribe(response => {
        //         console.log('Uploading status');
        //         console.log(response);
        //         offSet = response.headers.get('Upload-Offset');
        //         this.upload.uploadVideo(file, offSet.toString(), url).subscribe(patchResponse => {
        //             console.log(patchResponse);
        //             console.log('Successfully uploaded');
        //             localStorage.removeItem(key);
        //         });
        //     });
        // }
        // else {
        //     console.log('New upload');
        //     this.upload.createVideo(file).subscribe(response => {
        //         const metaData = {
        //             name: file.name,
        //             size: file.size,
        //             url: response.upload.upload_link
        //         };
        //         localStorage.setItem(key, JSON.stringify(metaData));
        //         this.upload.uploadVideo(file, offSet.toString(), response.upload.upload_link).subscribe(patchResponse => {
        //             console.log(patchResponse);
        //             console.log('Successfully uploaded');
        //             localStorage.removeItem(key);
        //         });
        //     });
        // }


    }

    success = () => {
        console.log('after video upload section');
    };
}

// Filename: upload.service.ts
import { Injectable } from '@angular/core';
import * as tus from 'tus-js-client';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { uploadFiles } from './app.component';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    constructor(private http: HttpClient) { }
    private api = 'https://api.vimeo.com/me/videos';
    private accessToken = 'API_KEY';

    createVideo(file: File): Observable<any> {
        const body = {
            name: file.name,
            upload: {
                approach: 'tus',
                size: file.size
            }
        };
        console.log(file);
        const header: HttpHeaders = new HttpHeaders()
            .set('Authorization', 'bearer ' + this.accessToken)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/vnd.vimeo.*+json;version=3.4');
        return this.http.post(this.api, body, {
            headers: header,
            observe: 'response'
        });
    }

    public tusUpload(
        file: uploadFiles,
        i: number,
        videoArray: uploadFiles[],
        uploadArray: tus.Upload[],
        success: any
    ): tus.Upload {
        const upload = new tus.Upload(file.video, {
            uploadUrl: file.uploadURI,
            endpoint: file.uploadURI,
            chunkSize: 1000 * 1024 * 1024,
            retryDelays: [0, 1000, 3000, 5000],
            onError: error => {
                console.log(error);
                console.log('Failed: ' + file.video.name + error);
            },
            onAfterResponse: (req, res) => {
                console.log('After response');
                console.log(res.getHeader('Upload-Offset'));
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                console.log(
                    'file: ' + i + ' of ' + (videoArray.length - 1) + ':',
                    bytesUploaded,
                    bytesTotal,
                    percentage + '%'
                );
            },
            onSuccess: () => {
                console.log('Download' + file.video.name + 'from' + upload.url);
                if (i < videoArray.length - 1) {
                    uploadArray[i + 1].start();
                } else {
                    success();
                    console.log('Videos uploaded successfully');
                }
            },
        });
        return upload;
    }
}
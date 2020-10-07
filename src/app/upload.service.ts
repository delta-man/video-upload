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
        return this.http.post(this.api, body, { headers: header })
    }

    public tusUpload(
        file: uploadFiles,
        success: any
    ): tus.Upload {
        console.log(`TUS Supported ${tus.isSupported}`);
        const upload = new tus.Upload(file.video, {
            uploadUrl: file.uploadURI,
            endpoint: file.uploadURI,
            storeFingerprintForResuming: true,
            removeFingerprintOnSuccess: false,
            retryDelays: [0, 1000, 3000, 5000, 10000],
            onError: error => {
                console.log('Failed: ' + file.video.name + error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                console.log(
                    bytesUploaded,
                    bytesTotal,
                    percentage + '%'
                );
            },
            onSuccess: () => {
                console.log('Download' + file.video.name + 'from' + upload.url);
                success();
                console.log('Videos uploaded successfully');
            },
        });
        return upload;
    }
}
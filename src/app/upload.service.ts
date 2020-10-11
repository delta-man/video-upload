// Filename: upload.service.ts
import { Injectable, EventEmitter } from '@angular/core';
import * as tus from 'tus-js-client';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { uploadFiles } from './app.component';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    onProgress = new EventEmitter<any>();
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

    uploadVideo(file: File, uploadOffset: string, url): Observable<any> {
        const header: HttpHeaders = new HttpHeaders()
            // .set('Authorization', 'bearer ' + this.accessToken)
            .set('Tus-Resumable', '1.0.0')
            .set('Upload-Offset', '0')
            .set('Content-Type', 'application/offset+octet-stream')
            .set('Accept', 'application/vnd.vimeo.*+json;version=3.4');
        return this.http.patch(url, file, { headers: header });
    }

    getStatus(url: string): Observable<any> {
        const header: HttpHeaders = new HttpHeaders()
            .set('Tus-Resumable', '1.0.0')
            .set('Accept', 'application/vnd.vimeo.*+json;version=3.4');
        return this.http.head(url, { headers: header, observe: 'response' });
    }

    public uploadProgres: string = '0';





    public tusUpload(
        file: uploadFiles,
        success: any
    ): tus.Upload {
        console.log(`TUS Supported ${tus.isSupported}`);
        const chunkSizeInMb = 256;
        const upload = new tus.Upload(file.video, {
            uploadUrl: file.uploadURI,
            endpoint: file.uploadURI,
            storeFingerprintForResuming: true,
            removeFingerprintOnSuccess: false,
            chunkSize: chunkSizeInMb * 1048576,// 67108864,//134217728,//67108864,//134217728,//201326592,//268435456,//536870912,
            retryDelays: [0, 1000, 3000, 5000, 10000],
            onError: error => {
                console.log('Failed: ' + file.video.name + error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                this.onProgress.emit(percentage);
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
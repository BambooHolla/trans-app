// import { Injectable } from '@angular/core';

// import { Http, Response } from '@angular/http';
// import { Observable } from "rxjs/Observable";

// import { Subject } from "rxjs/Subject";

// /*
//   Generated class for the FileUploadService provider.

//   See https://angular.io/docs/ts/latest/guide/dependency-injection.html
//   for more info on providers and Angular 2 DI.
// */
// @Injectable()
// export class FileService {

//   /**
//    * 获取id:  http://192.168.16.198:14010/fileId/dir/assign
//    * 文件增删改查： http://192.168.16.198:14010/file/{fileId}
//    */

//   constructor(public http: Http) {

//   }

//   getId() {
//     let serverUrl = 'http://192.168.16.198:14010/fileId/dir/assign'

//     // let params = new URLSearchParams();
//     // params.set('equityCode', term);
//     // console.dir(params.toString())

//     //return 
//     this.http.get(serverUrl)
//       .do(value => console.dir(value))
//       .map(response => {
//         const resData = response.json().data
//         // return resData
//         this.uploadTermStream.next(resData);
//       })
//       .catch(this.handleError)
//   }

//   private uploadTermStream = new Subject<string>();

//   upload(files: File[]) {
//     // return this.getId()
//     //   .switchMap(fileId => {
//     //     let serverUrl = `http://192.168.16.198:14010/file/${fileId}`
//     //     return this.http.post(serverUrl, { file: files[0] })
//     //       .do(value => console.dir("1: " + value))
//     //       .map(response => {
//     //         const resData = response.json().data
//     //         return resData
//     //       })
//     //       .catch(this.handleError)
//     //     }
//     //   )
//     this.uploadTermStream
//       .switchMap((fileId: string) => {
//         let serverUrl = `http://192.168.16.198:14010/file/${fileId}`
//         return this.http.post(serverUrl, { file: files[0] })
//           .do(value => console.dir("1: " + value))
//           .map(response => {
//             const resData = response.json().data
//             return resData
//           })
//           .catch(this.handleError)
//       })
//       // .do(value => console.dir(value))
//       .catch((err) => this.handleError(err, true))
//   }

//   private handleError(error: Response | any, donotThrow) {
//     let errMsg: string;
//     console.dir(error)
//     if (error instanceof Response) {
//       const body = error.json() || '';
//       const err = body.error || JSON.stringify(body);
//       errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
//     } else {
//       errMsg = error.message ? error.message : error.toString();
//     }
//     console.error(errMsg);
//     if (!donotThrow) {
//       return Observable.throw(errMsg);
//     } else {
//       return [];
//     }
//   }
// }

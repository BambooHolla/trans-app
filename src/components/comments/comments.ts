import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import { CommentService } from "./comments.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'comments',
  templateUrl: 'comments.html',
  providers:[
    CommentService,
  ]
})
export class Comments implements OnInit,OnDestroy {

  userId:string = "dsfsdfdd"//缓存中取

  @Input() newsId:string
  title:string = "";

  likedComment: CommentItem[] = [];
  comments: Observable<CommentItem[]>
  // poster: Observable<any>
  posterSubscription: Subscription

  commentListLength: number

  private getCommentsTermStream = new Subject<string>();
  // private postCommentsTermStream = new Subject<string>();

  getComments() {
    console.log('getComments()')
    this.getCommentsTermStream.next();
  }

  postComment(str:string){
    console.log(`postComment(${str})`)
    this.posterSubscription =  this.commentService
      .postComments(this.newsId,str)
      .subscribe(data=>{
        if(data&&data.status === "ok"){
          this.getComments()
        }
        //有返回就解除订阅
        this.posterSubscription.unsubscribe()                  
      })
  }

  constructor(
    private commentService:CommentService,
  ) {

  }

  ngOnInit() {
    // console.log('comments: ngOnInit')    
    //TODO:管道和observable异步 有转换问题
    this.comments = this.getCommentsTermStream
      .debounceTime(300)
      .switchMap(() => this.commentService.getComments(this.newsId))
      .do((data) => {
        console.log('getted')
        this.commentListLength = data.length
        this.title = this.likedComment.length ? window['language']['HOT_COMMENTS']||"热门评论" : window['language']['COMMENTS']||"评论";
      })
      .catch((err) => this.commentService.handleError(err, true))
    setTimeout(() => this.getComments(), 0); 
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe()   
    // console.log('comments: ngOnDestroy')
    if (this.posterSubscription){
      console.dir(this.posterSubscription)
      this.posterSubscription.unsubscribe()
    }
  }

  // getCommentList(){
  //   console.dir("comments get start")
  //   this.comments = this.commentService.getComments()
  //     .switchMap(data => {
  //       this.commentListLength = data.length
  //       console.dir(data)
  //       return data || {}
  //     })
  //     .catch((err) => this.commentService.handleError(err, true))

  // }  

  toggleLike(commentItem: CommentItem): void {
    //点赞或取消点赞
    if (this.isLiked(commentItem) !== false){
      commentItem.liker.splice(Number(this.isLiked(commentItem)));
      // console.log(commentItem.liker)
    }else{
      commentItem.liker.push(this.userId);
      // console.log(commentItem.liker)      
    }
  }
  isLiked(commentItem: CommentItem): boolean|string{
    for (let index in commentItem.liker){
      // if (liker.id === userId){
      if (commentItem.liker[index] === this.userId) {
        return index;
      }
    }
    return false;
  }
}

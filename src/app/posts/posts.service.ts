import { Post } from './post.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class PostsService {
  constructor(private http: HttpClient) {}
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
             .pipe(map((postData) => {
              return postData.posts.map(post => {
                return {
                  title: post.title,
                  content: post.content,
                  id: post._id
                };
              });
             }))
             .subscribe(
              (transformedPosts) => {
                this.posts = transformedPosts;
                this.postsUpdated.next([...this.posts]);
              }
             );
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, id?: string ) {
    const post: Post = {
      id: id,
      title: title,
      content: content
    };
    this.http.post('http://localhost:3000/api/posts', post)
              .subscribe(
                (responseData: any) => {
                  post.id = responseData.post._id;
                  this.posts.push(post);
                  this.postsUpdated.next([...this.posts]);
                }
              );

  }

  deletePost(postId: string) {
    this.http.delete('http://localhost:3000/api/posts/' +  postId)
              .subscribe(
                (response) => {
                  this.posts = this.posts.filter((post) => post.id !== postId);
                  this.postsUpdated.next([...this.posts]);
                }
              );
  }
}

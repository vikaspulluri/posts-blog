import { Post } from './post.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class PostsService {
  constructor(private http: HttpClient, private router: Router) {}
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
             .pipe(map((postData) => {
              return postData.posts.map(post => {
                return {
                  title: post.title,
                  content: post.content,
                  id: post._id,
                  imagePath: post.imagePath
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

  addPost(title: string, content: string, image: File, id?: string ) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post('http://localhost:3000/api/posts', postData)
              .subscribe(
                (responseData: any) => {
                  const post: Post = {id: responseData.post.id, title: title, content: content, imagePath: responseData.post.imagePath};
                  this.posts.push(post);
                  this.postsUpdated.next([...this.posts]);
                  this.router.navigate(['/']);
                }
              );

  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {id: id, title: title, content: content, imagePath: image};
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData)
              .subscribe(
                (response: {id: string, title: string, content: string, imagePath: string}) => {
                 const updatedPosts = [...this.posts];
                 const post = {id: id, title: title, content: content, imagePath: response.imagePath};
                 const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
                 updatedPosts[oldPostIndex] = post;
                 this.posts = updatedPosts;
                 this.postsUpdated.next([...this.posts]);
                 this.router.navigate(['/']);
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

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>('http://localhost:3000/api/posts/' + id);
  }
}

import { Post } from './post.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { config } from '../app.config';

@Injectable({providedIn: 'root'})
export class PostsService {
  constructor(private http: HttpClient, private router: Router) {}
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postsCount: number}>();

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{message: string, posts: any, totalPosts: number}>(config.apiUrl + '/api/posts' + queryParams)
             .pipe(map((postData) => {
              return {
                posts: postData.posts.map(post => {
                  return {
                    title: post.title,
                    content: post.content,
                    id: post._id,
                    imagePath: post.imagePath,
                    creator: post.creator
                  };
                }),
                totalPosts: postData.totalPosts};
             }))
             .subscribe(
              (transformedPostsData) => {
                this.posts = transformedPostsData.posts;
                this.postsUpdated.next({
                  posts: [...this.posts],
                  postsCount: transformedPostsData.totalPosts
                });
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
    this.http.post(config.apiUrl + '/api/posts', postData)
              .subscribe(
                (responseData: any) => {
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
      postData = {id: id, title: title, content: content, imagePath: image, creator: null};
    }
    this.http.put(config.apiUrl + '/api/posts/' + id, postData)
              .subscribe(
                (response: {id: string, title: string, content: string, imagePath: string}) => {
                 this.router.navigate(['/']);
                }
              );
  }

  deletePost(postId: string) {
    return this.http.delete(config.apiUrl + '/api/posts/' +  postId);
  }

  getPost(id: string) {
    return this.http.get<{_id: string,
                          title: string,
                          content: string,
                          imagePath: string,
                          creator: string}>(config.apiUrl + '/api/posts/' + id);
  }
}

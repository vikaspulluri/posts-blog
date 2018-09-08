import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  isLoading = false;
  postsPerPage = 2;
  totalPosts = 0;
  currentPage = 1;
  private postsSubscription: Subscription;
  private authListenSubs: Subscription;
  public userIsAuthenticated = false;
  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSubscription = this.postsService.getPostUpdateListener().subscribe(
      (postsData: {posts: Post[], postsCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postsData.postsCount;
        this.posts = postsData.posts;
      }
    );
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
  }

  onDeletePost(postId: string) {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(
      () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      }
    );
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);

  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
    this.authListenSubs.unsubscribe();
  }

}

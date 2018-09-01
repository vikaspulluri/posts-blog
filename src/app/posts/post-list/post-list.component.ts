import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  // posts = [
  //   {title: 'Third Post', content: 'First post content'},
  //   {title: 'Second Post', content: 'Second post content'},
  //   {title: 'Third Post', content: 'Third post content'}
  // ];
  posts: Post[] = [];
  private postsSubscription: Subscription;
  constructor(private postsService: PostsService) { }

  ngOnInit() {
    this.posts = this.postsService.getPosts();
    this.postsSubscription = this.postsService.getPostUpdateListener().subscribe(
      (posts: Post[]) => this.posts = posts
    );
  }

  ngOnDestroy(): void {
    this.postsSubscription.unsubscribe();
  }

}

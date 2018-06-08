import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post';
import {PostService} from '../post.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[];
  private postSubscription: Subscription;
  constructor(private postService: PostService) {
  }

  ngOnInit() {
    this.posts = this.postService.getPosts();
    this.postSubscription = this.postService.getPostUpdateListenter().subscribe( (post: Post[]) => {
      this.posts = post;
    });
  }

  ngOnDestroy(): void {
    this.postSubscription.unsubscribe();
  }

}

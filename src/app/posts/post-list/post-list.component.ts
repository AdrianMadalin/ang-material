import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post';
import {PostService} from '../post.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[];
  private postSubscription: Subscription;

  constructor(private postService: PostService,
              private router: Router) {
  }

  ngOnInit() {
    this.postService.getPosts();
    this.postSubscription = this.postService.getPostUpdateListenter()
      .subscribe((post: Post[]) => {
        this.posts = post;
      });
  }

  ngOnDestroy(): void {
    this.postSubscription.unsubscribe();
  }
/*
  onDeletePost(id: number, index: number) {
    console.log(`Clicked on id ${id}`);
    this.postService.deteletPost(id, index);
  }
*/
  onDelete(id: string) {
    this.postService.deletePost(id);
  }

  onEdit(id: string) {

  }

}

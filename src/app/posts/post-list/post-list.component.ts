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
  public isLoading = false;

  constructor(private postService: PostService,
              private router: Router) {
  }

  ngOnInit() {
    this.postService.getPosts();
    this.isLoading = true;
    this.postSubscription = this.postService.getPostUpdateListenter()
      .subscribe((post: Post[]) => {
        this.posts = post;
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.postSubscription.unsubscribe();
  }

  onDelete(id: string) {
    this.postService.deletePost(id);
  }

  onEdit(post) {
    console.log(post);
    this.router.navigate([`/edit/${post.id}`]);
  }

}

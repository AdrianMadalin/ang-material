import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post';
import {PostService} from '../post.service';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {PageEvent} from '@angular/material';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[];
  private postSubscription: Subscription;
  public isLoading = false;
  public totalPosts = 0;
  public postsPerPage = 1;
  public pageSizeOptions = [1, 2, 5, 10];
  public currentPage = 1;

  constructor(private postService: PostService,
              private router: Router) {
  }

  ngOnInit() {
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.isLoading = true;
    this.postSubscription = this.postService.getPostUpdateListenter()
      .subscribe((postData: {posts: Post[], postCount: number}) => {
        this.posts = postData.posts;
        this.isLoading = false;
        this.totalPosts = postData.postCount;
      });
  }

  ngOnDestroy(): void {
    this.postSubscription.unsubscribe();
  }

  onDelete(id: string) {
    this.postService.deletePost(id).subscribe((response) => {
      this.isLoading = true;
      console.log(response);
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onEdit(post) {
    console.log(post);
    this.router.navigate([`/edit/${post.id}`]);
  }

  onChangedPange(pageData: PageEvent) {
    console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

}

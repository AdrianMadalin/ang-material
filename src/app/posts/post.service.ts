import {Injectable} from '@angular/core';
import {PostModel} from './post.model';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: PostModel[] = [];
  public postsUpdated: Subject<PostModel[]> = new Subject<PostModel[]>();

  constructor() {
  }

  getPosts() {
    return [...this.posts];
  }

  public getPostUpdateListenter() {
    return this.postsUpdated.asObservable();
  }

  addPosts(post: PostModel) {
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);
  }
}

import {Injectable} from '@angular/core';
import {Post} from './post';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  public postsUpdated: Subject<Post[]> = new Subject<Post[]>();

  constructor() {
  }

  getPosts() {
    return [...this.posts];
  }

  public getPostUpdateListenter() {
    return this.postsUpdated.asObservable();
  }

  addPosts(post: Post) {
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);
  }
}

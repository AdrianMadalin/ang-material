import {Injectable} from '@angular/core';
import {Post} from './post';
import {Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  public postsUpdated: Subject<Post[]> = new Subject<Post[]>();

  constructor(private http: HttpClient) {
  }

  getPosts() {
    const url = 'http://localhost:8080/api/posts';
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    this.http
      .get<{ message: string, posts: any }>(url, {headers})
      .pipe(map((postData) => {
        return postData.posts.map((post) => {
          return {
            id: post._id,
            title: post.title,
            content: post.content
          };
        });
      }))
      .subscribe((transformedPosts) => {
        console.log(transformedPosts);
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  public getPostUpdateListenter() {
    return this.postsUpdated.asObservable();
  }

  addPosts(post: Post) {
    const url = 'http://localhost:8080/api/posts';
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    this.http.post<{ message: string, post: object }>(url, post, {headers})
      .subscribe((responseData) => {
        post.id = responseData.post['_id'];
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  deteletPost(id: number, index: number) {
    const url = 'http://localhost:8080/api/posts';
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    this.http
      .put(url, {_id: id}, {headers})
      .subscribe((recivedResponse) => {
        this.posts.splice(index, 1);
        this.postsUpdated.next([...this.posts]);
        console.log(recivedResponse);
      });
  }

  deletePost(postId: string) {
    const url = 'http://localhost:8080/api/posts/' + postId;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    this.http
      .delete(url, {headers})
      .subscribe((data) => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPost(id: string) {
    return {...this.posts.find(p => p.id === id)};
  }

  updatePost(id: string, title: string, content: string) {
    const url = 'http://localhost:8080/api/posts/' + id;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    const post: Post = {id, title, content};
    this.http
      .put<{ message: string }>(url, post, {headers})
      .subscribe((response) => {

      });
  }
}

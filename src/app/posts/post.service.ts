import {Injectable} from '@angular/core';
import {Post} from './post';
import {Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  public postsUpdated: Subject<Post[]> = new Subject<Post[]>();

  constructor(private http: HttpClient,
              private router: Router) {
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
            content: post.content,
            imagePath: post.imagePath
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

  addPosts(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    const url = 'http://localhost:8080/api/posts';
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    this.http.post<{ message: string, post: object }>(url, postData, {headers})
      .subscribe((responseData) => {
        const post: Post = {
          id: responseData.post['_id'],
          title: responseData.post['title'],
          content: responseData.post['content'],
          imagePath: responseData.post['imagePath']
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate([`/`]);
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
    const url = 'http://localhost:8080/api/posts/' + id;
    return this.http.get<{message: string, post: Post}>(url);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    const url = 'http://localhost:8080/api/posts/' + id;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');

    if(typeof(image) === 'object') {
      const postData = new FormData();
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      const postData: Post = {id, title, content, imagePath: null};
    }
    this.http
      .put<{ message: string }>(url, postData, {headers})
      .subscribe((response) => {
        console.log(response);
        if (response.message === 'success') {
          const updatedPosts = [...this.posts];
          const oldPostIndex = updatedPosts.findIndex( p => p.id === postData.id);
          updatedPosts[oldPostIndex] = postData;
          this.postsUpdated.next([...this.posts]);
          this.router.navigate([`/`]);
        }
      });
  }
}

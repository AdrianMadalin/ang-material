import {Injectable} from '@angular/core';
import {Post} from './post';
import {Subject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthData} from '../auth/auth-data.model';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Post[] = [];
  public postsUpdated: Subject<{posts: Post[], postCount: number}> = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient,
              private router: Router,
              private authService: AuthService) {
  }

  getPosts(ppg: number, currentPage: number) {
    const queryParams = `?ppg=${ppg}&page=${currentPage}`;
    const url = 'http://localhost:8080/api/posts' + queryParams;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    this.http
      .get<{ message: string, posts: any, maxPosts: number }>(url, {headers})
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map((post) => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }), maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
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
          imagePath: responseData.post['imagePath'],
          creator: responseData.post['creator'],
        };
        this.posts.push(post);
        this.router.navigate([`/`]);
      });
  }

  deletePost(postId: string) {
    const url = 'http://localhost:8080/api/posts/' + postId;
    const headers = new HttpHeaders().append('Content-Type', 'application/json');
    return this.http.delete(url, {headers});
  }

  getPost(id: string) {
    const url = 'http://localhost:8080/api/posts/' + id;
    return this.http.get<{ message: string, post: Post }>(url);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    const url = 'http://localhost:8080/api/posts/' + id;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      console.log(image);
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {id, title, content, imagePath: image, creator: null};
    }

    this.http
      .put<{ message: string, post: Post }>(url, postData, {headers})
      .subscribe((response) => {
        console.log(response);
        if (response.message === 'success') {
          const updatedPosts = [...this.posts];
          const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
          const post: Post = {id, title, content, imagePath: response.post.imagePath, creator: response.post.creator};
          updatedPosts[oldPostIndex] = post;
          this.router.navigate([`/`]);
        }
      });
  }
}

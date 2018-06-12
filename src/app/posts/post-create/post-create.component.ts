import {Component, OnInit} from '@angular/core';
import {Post} from '../post';
import {NgForm} from '@angular/forms';
import {PostService} from '../post.service';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  private mode = 'create';
  private postId: string;
  public post: Post;

  constructor(private postService: PostService,
              public route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.postService.getPost(this.postId).subscribe((response) => {
          this.post = {id: response.post['_id'], title: response.post['title'], content: response.post['content']};
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost(form: NgForm) {
    const post: Post = {
      id: null,
      title: form.value.title,
      content: form.value.content
    };
    if (form.value.title.length > 0 && form.value.content.length > 0) {
      if (this.mode === 'create') {
        this.postService.addPosts(post);
      } else {
        this.postService.updatePost(this.postId, post.title, post.content);
      }
    }
    form.reset();
  }

}

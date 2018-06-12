import {Component, OnInit} from '@angular/core';
import {Post} from '../post';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
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
  public isLoading = false;
  public form: FormGroup;

  constructor(private postService: PostService,
              public route: ActivatedRoute) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((response) => {
          this.isLoading = false;
          this.post = {id: response.post['_id'], title: response.post['title'], content: response.post['content']};
          this.form.setValue({
            title: this.post.title,
            content: this.post.content
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }

    const post: Post = {
      id: null,
      title: this.form.value.title,
      content: this.form.value.content
    };
    this.isLoading = true;
    if (this.form.value.title.length > 0 && this.form.value.content.length > 0) {
      if (this.mode === 'create') {
        this.postService.addPosts(post);
      } else {
        this.postService.updatePost(this.postId, post.title, post.content);
      }
    }
    this.form.reset();
  }
}

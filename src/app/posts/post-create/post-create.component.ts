import {Component, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../post';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PostService} from '../post.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {mimeType} from './mime-type.validator';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  private mode = 'create';
  private postId: string;
  public post: Post;
  public isLoading = false;
  public form: FormGroup;
  public imagePreview: string;
  private authStatusSub: Subscription;
  constructor(private postService: PostService,
              public route: ActivatedRoute,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe((authService) =>{
        this.isLoading = false;
    });
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      }),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((response) => {
          this.isLoading = false;
          this.post = {
            id: response.post['_id'],
            title: response.post['title'],
            content: response.post['content'],
            imagePath: response.post['imagePath'],
            creator: response.post['creator']
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
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
    this.isLoading = true;
    if (this.form.value.title.length > 0 && this.form.value.content.length > 0) {
      if (this.mode === 'create') {
        this.postService.addPosts(
          this.form.value.title,
          this.form.value.content,
          this.form.value.image
        );
      } else {
        this.postService.updatePost(
          this.postId,
          this.form.value.title,
          this.form.value.content,
          this.form.value.image
        );
      }
    }
    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({'image': file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
    console.log(file);
    console.log(this.form);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}

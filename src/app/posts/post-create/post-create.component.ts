import {Component, OnInit} from '@angular/core';
import {Post} from '../post';
import {NgForm} from '@angular/forms';
import {PostService} from '../post.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  constructor(private postService: PostService) {
  }

  ngOnInit() {
  }

  onAddPost(form: NgForm) {
    const post: Post = {
      title: form.value.title,
      content: form.value.content
    };
    if (form.value.title.length > 0 && form.value.content.length > 0) {
      this.postService.addPosts(post);
      form.reset();
    }
  }

}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit  {

  myForm!: FormGroup;

  @ViewChild('username') nameKey!: ElementRef;
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.myForm = new FormGroup({
      myInput: new FormControl('', Validators.required)
    });
  }

  startQuiz(category: string): void {

    const usernameValue = this.nameKey.nativeElement.value;

    localStorage.setItem("username", this.nameKey.nativeElement.value);
    // localStorage.setItem("username", usernameValue);

    let fieldInput: string = this.nameKey.nativeElement.value;
    // let fieldInput: string = usernameValue;

    let myVar = document.getElementById("thinkTank");
    let myVar2 = document.getElementById("errorMsg");

    if(fieldInput== "" && myVar != null && myVar2 != null){

        myVar.style.border = 'red solid 1px';
        myVar2.style.display = 'block';

    }
    else {
      this.router.navigate(['/quiz', category]);
    }
  }


}

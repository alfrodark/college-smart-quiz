import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionService } from '../../services/question.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, map, take, timer } from 'rxjs';
import localforage from 'localforage';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
  providers: [DatePipe]

})
export class QuizComponent implements OnInit, OnDestroy {
  categories: string[] = ['math', 'science', 'economics']; // Add more categories as needed
  selectedCategory: string = '';
  questions: any[] = [];
  category: string = '';

  username : string="";
  quizData: any;
  totalQuestions!: number;
  correctAnswers: any = 0;
  timer: any;
  counter: number = 0;
  shuffledQuestions!: any[];

  timerSubscription!: Subscription;
  timeRemaining: number = 0;
  quizDuration: number = 600;
  remainingTime!: number;
  currentQuestionIndex: number = 0;
  incorrectAnswers: any = 0;
  quizEnded: boolean = false;
  unansweredQuestions: number = 0;
  totalPoints: number = 0;
  userAnswers: { [key: number]: string } = {};
  questionPoints: { [key: string]: number } = {};

  timerValue: number = 0;
  timerLimit: number = 600;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private questionService: QuestionService)
    {}

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.category = params['category'];
      this.loadQuestions();
    });

    if (typeof localStorage !== 'undefined') {
      this.username = localStorage.getItem("username")!;
      console.log(this.username);
    } else if (localforage.supports(localforage.LOCALSTORAGE)) {
      // Use localforage as a fallback
      localforage.getItem('username').then((storedData) => {
        console.log(storedData);
      });
    } else {
      console.warn('localStorage is not available, and localforage is not supported.');
      // Handle the absence of both localStorage and localforage if needed
    }

    this.startQuizTimer();
    // this.startTimer();
  }

  transform(seconds: number): string {
    const date = new Date(0);
    date.setSeconds(seconds);
    return this.datePipe.transform(date, 'mm:ss')!;
  }

  isOptionSelected(option: string): boolean {
    return this.userAnswers[this.currentQuestionIndex] === option;
  }

  isOptionCorrect(option: string): boolean {
    // Assuming you have a correctAnswer field in each question
    return this.quizData[this.currentQuestionIndex]?.correctAnswer === option;
  }

  loadQuestions(): void {
    if (this.category) {
      this.questionService.getQuestions(this.category).subscribe(
        (data) => {
          this.quizData = this.shuffleArray(data.questions);
          this.totalQuestions = this.quizData.length;
          // this.startQuizTimer();
          this.initializeUserAnswers();

        },
        (error) => {
          console.error('Error fetching questions:', error);
        }
      );
    }
  }

  initializeUserAnswers() {
    this.userAnswers = {};
    for (const question of this.quizData) {
      this.userAnswers[question.question] = "";
    }
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  startQuizTimer() {
    this.remainingTime = this.quizDuration;
    this.timerSubscription = timer(0, 1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.endQuiz();
      }
    });
  }

  // startTimer(): void {
  //   this.timerSubscription = timer(0, 1000)
  //     .pipe(
  //       take(this.timerLimit),
  //       map(() => --this.timerValue)
  //     )
  //     .subscribe(
  //       () => {},
  //       () => {},
  //       () => {
  //         // Timer completed, navigate to the result page or handle accordingly
  //         this.router.navigate(['/result']);
  //       }
  //     );
  // }

  endQuiz() {
    this.timerSubscription.unsubscribe();
    this.calculateScore();
    this.quizEnded = true;
  }

   calculateScore() {

     this.correctAnswers = this.quizData.filter(
       (      question: { selectedAnswer: any; correctAnswer: any; }) => question.selectedAnswer === question.correctAnswer
     ).length;
     this.incorrectAnswers = this.quizData.filter(
      (      question: { selectedAnswer: any; correctAnswer: any; }) => question.selectedAnswer !== question.correctAnswer
    ).length;
    this.unansweredQuestions = this.quizData.filter(
      (      question: { selectedAnswer: any; correctAnswer: any; }) => question.selectedAnswer === null
    ).length;
     this.totalPoints = this.correctAnswers * 2 - this.incorrectAnswers * 2;

   }

  getProgressPercentage() {
    return ((this.quizDuration - this.remainingTime) / this.quizDuration) * 100;

  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
    }
    this.calculateScore();
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

}

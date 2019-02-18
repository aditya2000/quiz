import React, { Component } from "react";
import "./quiz.css";
import app from "../../config/base";
import firebase from "../../config/base";

class Quiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quiz: [],
      numOfQuestions: 0,
      level: 1,
      answer: "",
      correct: false
    };
    this.getQuizData = this.getQuizData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.logout = this.logout.bind(this);
    this.updateLevel = this.updateLevel.bind(this);

    this.db = firebase.firestore();
    this.db.settings({
      timestampsInSnapshots: true
    });
  }

  componentDidMount() {
    this.getQuizData();
    this.updateLevel();
  }

  componentWillMount() {}

  logout() {
    app.auth().signOut();
  }

  updateLevel() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        alert("user exist");
        //console.log(firebase.auth().currentUser.getIdToken());
        //alert(firebase.auth().currentUser.getToken());
        console.log(firebase.auth().currentUser.uid);
        this.db
          .collection("users")
          .where("userid", "==", firebase.auth().currentUser.uid)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              var newLevel = doc.data().level;
              this.setState(
                {
                  level: newLevel
                },
                () => console.log(this.state)
              );
              console.log(doc.id, "=>", doc.data());
              console.log(doc.data().level);
            });
          });
      } else {
        console.log("USER NOT LOGGED IN");
      }
    });
  }

  getQuizData() {
    var data = require("../../questions.json");
    if (true) {
      this.setState(
        {
          quiz: data.questions,
          numOfQuestions: data.questions.length
        },
        () => console.log(this.state)
      );
    }
  }

  handleChange(e) {
    this.setState({
      answer: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.state.quiz.map(question => {
      if (this.state.level.toString() === question.level) {
        if (this.state.answer.toLowerCase() === question.answer) {
          alert("You're right!!");

          this.setState(
            prev => ({
              level: prev.level + 1
            }),
            () => console.log(this.state)
          );
          const db = this.db;
          const state = this.state;

          db.collection("users")
            .where("userid", "==", firebase.auth().currentUser.uid)
            .get()
            .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                db.collection("users")
                  .doc(doc.id)
                  .update({
                    level: state.level
                  });
              });
            });
        } else {
          alert("Fuck Off");
        }
      }
    });
  }

  render() {
    return (
      <div className="quiz">
        <h1>Quiz</h1>
        <button onClick={this.logout}>Logout</button>

        {this.state.quiz.map(question => {
          if (this.state.level.toString() === question.level) {
            return (
              <div key={Math.random()}>
                <p>{question.level}</p>
                <img src={question.question} />
              </div>
            );
          } else {
            return <div key={Math.random()} />;
          }
        })}
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="enter your answer"
            onChange={this.handleChange}
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default Quiz;

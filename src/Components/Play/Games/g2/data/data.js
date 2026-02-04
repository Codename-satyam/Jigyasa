import virat from "./images/virat.jpg";
import elon from "./images/elon.jpg";
import gandhi from "./images/gandhi.jpg";
import naruto from "./images/naruto.jpg";

const quizData = [
  {
    image: virat,
    question: "Who is this person?",
    options: ["Virat Kohli", "MS Dhoni", "Rohit Sharma", "Sachin Tendulkar"],
    answer: "Virat Kohli",
  },
  {
    image: elon,
    question: "Who is this person?",
    options: ["Jeff Bezos", "Elon Musk", "Bill Gates", "Mark Zuckerberg"],
    answer: "Elon Musk",
  },
  {
    image: gandhi,
    question: "Who is this person?",
    options: ["Bhagat Singh", "Subhash Chandra Bose", "Mahatma Gandhi", "Nehru"],
    answer: "Mahatma Gandhi",
  },
  {
    image: naruto,
    question: "Who is this character?",
    options: ["Luffy", "Goku", "Naruto", "Ichigo"],
    answer: "Naruto",
  },
];

export default quizData;

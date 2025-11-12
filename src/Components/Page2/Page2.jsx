import "./Page2.css";

function Page2() {
  return (
    <div className="page-2">
      <div className="p2">
        <div className="start1">
          <h2>
            Learn what your wards<span><br />would gain from us</span>
          </h2>
          <p>
            This educational / learning activity is designed to develop mental
            aptitude in kids. By engaging kids in brain teasers, our mind games
            help enhance various critical skill-sets like critical thinking,
            problem-solving, and creativity.
          </p>
        </div>

        <div className="boxes">
          <div className="box">
            <h3>The Programmer</h3>
            <ul>
              <li>Personalized <br /> Worksheets</li>
              <li>Daily Brain Workout</li>
              <li>Gamified Format</li>
              <li>Available offline</li>
              <li>Fun & Engaging</li>
              <li>Track Improvement</li>
            </ul>
          </div>

          <div className="box">
            <h3>The Fixer</h3>
            <ul>
              <li>International Exams <br />taken by 10 lakh+ <br /> kids</li>
              <li>No maths, no science. <br /> Only focus on mental <br />ability</li>
              <li>Certificates</li>
            </ul>
          </div>

          <div className="box">
            <h3>The Thinker</h3>
            <ul>
              <li>Encouraging the <br />creativity of kids</li>
              <li>Personality<br />Enhancement prog.</li>
              <li>Dance and music <br />classes</li>
              <li>Art and craft <br />classes</li>
            </ul>
          </div>
        </div>

        <div className="buttons">
          <a href="/quiz" className="button2">Start Quiz</a>
          <a href="#contact" className="button3">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
export default Page2;
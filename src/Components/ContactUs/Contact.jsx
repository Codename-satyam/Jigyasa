import React, { useState } from "react";
import "./Contact.css";
import { FiArrowRight } from 'react-icons/fi';

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSent(false);
    }, 2200);
  };

  return (
    <div className="contact-root">
      <div className="center">
        <div className="container">
          <h1 className="title">Contact first ☝️</h1>
          <form onSubmit={onSubmit} className="contact-form">
            <div className={`form form__1 ${name ? "active" : ""}`}>
              <label htmlFor="name" className="form__label">Full name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form__input"
                required
                autoComplete="name"
              />
            </div>

            <div className={`form form__2 ${email ? "active" : ""}`}>
              <label htmlFor="email" className="form__label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form__input"
                required
                autoComplete="email"
              />
            </div>

            <div className={`form form__3 ${message ? "active" : ""}`}>
              <label htmlFor="message" className="form__label">Your message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="form__textarea"
                required
                rows="5"
              />
            </div>

            <button type="submit" className="form__btn" aria-live="polite">
              <span className={`form__btn--visible ${sent ? "invisible" : ""}`}>
                <p>Submit</p>
                <FiArrowRight style={{verticalAlign: 'middle'}} />
              </span>
              <span className={`form__btn--invisible ${sent ? "visible" : ""}`}>Message sent!</span>
            </button>
          </form>

          <div className="container-mail">
            <div className="mail" aria-hidden>
              <div className="mail__back" />
              <div className={`mail__top ${sent ? "closed" : ""}`} />
              <div className={`mail__letter ${sent ? "move" : ""}`}>
                <div className="mail__letter-square" />
                <div className="mail__letter-lines" />
              </div>
              <div className="mail__left" />
              <div className="mail__right" />
              <div className="mail__bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;

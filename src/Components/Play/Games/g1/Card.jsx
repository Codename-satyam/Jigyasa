function Card({ card, handleChoice, flipped }) {
  return (
    <div className="card" onClick={() => handleChoice(card)}>
      <div
        className={`card-inner ${flipped ? "flipped" : ""}`}
      >
        <div className="card-front"></div>
        <div
          className="card-back"
          style={{ backgroundColor: card.color }}
        ></div>
      </div>
    </div>
  );
}

export default Card;

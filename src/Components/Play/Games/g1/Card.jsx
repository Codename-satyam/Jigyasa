function Card({ card, handleChoice, flipped }) {
  // We handle the click here, but only if the card isn't already flipped or matched
  const handleClick = () => {
    if (!flipped && !card.matched) {
      handleChoice(card);
    }
  };

  return (
    <div 
      className={`card ${flipped ? "flipped" : ""} ${card.matched ? "matched" : ""}`} 
      onClick={handleClick}
    >
      {/* FRONT: The colored side that gets revealed */}
      <div className="front" style={{ backgroundColor: card.color }}></div>
      
      {/* BACK: The dark cyberpunk scanline pattern (shown by default) */}
      <div className="back"></div>
    </div>
  );
}

export default Card;
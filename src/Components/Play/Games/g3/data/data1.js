import tajMahal from "./images/tajmahal.jpg";
import eiffelTower from "./images/eiffel.jpg";
import statueOfLiberty from "./images/liberty.jpg";
import colosseum from "./images/colloseum.jpg";
import greatWall from "./images/greatwall.jpg";
import christRedeemer from "./images/redeemer.jpg";
import petra from "./images/petra.jpg";
import machuPicchu from "./images/machupichu.jpg";
import pyramids from "./images/pyramids.jpg";
import sydneyOperaHouse from "./images/sydneyoperahouse.jpg";

// New Imports
import bigBen from "./images/bigben.jpg";
import burjKhalifa from "./images/burjkhalifa.jpg";
import qutubMinar from "./images/qutubminar.jpg";
import redFort from "./images/redfort.jpg";
import angkorWat from "./images/angkorwat.jpg";
import chichenItza from "./images/chichenitza.jpg";
import mountRushmore from "./images/mountrushmore.jpg";
import acropolis from "./images/acropolis.jpg";
import parthenon from "./images/parthenon.jpg";
import forbiddenCity from "./images/forbiddencity.jpg";
import goldenGate from "./images/goldengate.jpg";
import leaningTower from "./images/leaningtower.jpg";
import louvre from "./images/louvre.jpg";
import stonehenge from "./images/stonehenge.jpg";
import sagradaFamilia from "./images/sagradafamilia.jpg";
import humayunTomb from "./images/humayuntomb.jpg";
import gatewayOfIndia from "./images/gatewayofindia.jpg";
import charminar from "./images/charminar.jpg";
import lotusTemple from "./images/lotustemple.jpg";
import kremlin from "./images/kremlin.jpg";
import neuschwanstein from "./images/neuschwanstein.jpg";
import towerBridge from "./images/towerbridge.jpg";
import pantheon from "./images/pantheon.jpg";
import alhambra from "./images/alhambra.jpg";
import buckingham from "./images/buckingham.jpg";
import versailles from "./images/versailles.jpg";
import potala from "./images/potala.jpg";
import borobudur from "./images/borobudur.jpg";
import terracotta from "./images/terracotta.jpg";
import hagiaSophia from "./images/hagiasophia.jpg";

const quizData = [
  // Your Original 10 (unchanged)
  { image: tajMahal, question: "Which monument is this?", options: ["Red Fort", "Qutub Minar", "Taj Mahal", "Hawa Mahal"], answer: "Taj Mahal" },
  { image: eiffelTower, question: "Identify this monument.", options: ["Statue of Liberty", "Eiffel Tower", "Big Ben", "Colosseum"], answer: "Eiffel Tower" },
  { image: statueOfLiberty, question: "What is the name of this monument?", options: ["Christ the Redeemer", "Statue of Liberty", "The Thinker", "Liberty Bell"], answer: "Statue of Liberty" },
  { image: colosseum, question: "Which ancient structure is shown here?", options: ["Pantheon", "Colosseum", "Acropolis", "Parthenon"], answer: "Colosseum" },
  { image: greatWall, question: "This monument is famously known as?", options: ["Silk Road", "Great Wall of China", "Forbidden City", "Stone Wall"], answer: "Great Wall of China" },
  { image: christRedeemer, question: "Name this iconic statue.", options: ["Statue of Liberty", "Christ the Redeemer", "Mount Rushmore", "The Sphinx"], answer: "Christ the Redeemer" },
  { image: petra, question: "Which historical monument is this?", options: ["Machu Picchu", "Petra", "Angkor Wat", "Chichen Itza"], answer: "Petra" },
  { image: machuPicchu, question: "Identify this ancient Incan site.", options: ["Petra", "Chichen Itza", "Machu Picchu", "Tikal"], answer: "Machu Picchu" },
  { image: pyramids, question: "These structures are known as?", options: ["Ziggurats", "Step Pyramids", "Pyramids of Giza", "Mayan Temples"], answer: "Pyramids of Giza" },
  { image: sydneyOperaHouse, question: "Which famous building is this?", options: ["Lotus Temple", "Sydney Opera House", "Burj Khalifa", "Empire State Building"], answer: "Sydney Opera House" },

  // 30 New Monuments
  { image: bigBen, question: "Identify this clock tower.", options: ["Big Ben", "Eiffel Tower", "Tower Bridge", "London Eye"], answer: "Big Ben" },
  { image: burjKhalifa, question: "Which skyscraper is this?", options: ["Burj Khalifa", "Shanghai Tower", "One World Trade Center", "Petronas Towers"], answer: "Burj Khalifa" },
  { image: qutubMinar, question: "Name this Indian monument.", options: ["Qutub Minar", "Red Fort", "India Gate", "Charminar"], answer: "Qutub Minar" },
  { image: redFort, question: "Which fort is shown here?", options: ["Red Fort", "Amber Fort", "Agra Fort", "Golconda Fort"], answer: "Red Fort" },
  { image: angkorWat, question: "Identify this temple complex.", options: ["Angkor Wat", "Borobudur", "Wat Arun", "Batu Caves"], answer: "Angkor Wat" },
  { image: chichenItza, question: "This Mayan pyramid is called?", options: ["Chichen Itza", "Machu Picchu", "Tikal", "Teotihuacan"], answer: "Chichen Itza" },
  { image: mountRushmore, question: "Which monument features US presidents?", options: ["Mount Rushmore", "Lincoln Memorial", "Statue of Liberty", "Capitol Hill"], answer: "Mount Rushmore" },
  { image: acropolis, question: "This ancient Greek site is called?", options: ["Acropolis", "Colosseum", "Pantheon", "Agora"], answer: "Acropolis" },
  { image: parthenon, question: "Name this Greek temple.", options: ["Parthenon", "Pantheon", "Acropolis", "Temple of Zeus"], answer: "Parthenon" },
  { image: forbiddenCity, question: "Identify this Chinese palace.", options: ["Forbidden City", "Great Wall", "Summer Palace", "Temple of Heaven"], answer: "Forbidden City" },
  { image: goldenGate, question: "This famous bridge is?", options: ["Golden Gate Bridge", "Brooklyn Bridge", "Tower Bridge", "Sydney Harbour Bridge"], answer: "Golden Gate Bridge" },
  { image: leaningTower, question: "Name this tilted tower.", options: ["Leaning Tower of Pisa", "Big Ben", "Eiffel Tower", "CN Tower"], answer: "Leaning Tower of Pisa" },
  { image: louvre, question: "Which museum is this?", options: ["Louvre Museum", "British Museum", "Vatican Museum", "Prado Museum"], answer: "Louvre Museum" },
  { image: stonehenge, question: "These prehistoric stones are called?", options: ["Stonehenge", "Easter Island", "Megalith Circle", "Druids Circle"], answer: "Stonehenge" },
  { image: sagradaFamilia, question: "Name this Spanish basilica.", options: ["Sagrada Familia", "La Rambla", "Alhambra", "Cologne Cathedral"], answer: "Sagrada Familia" },
  { image: humayunTomb, question: "Identify this Mughal monument.", options: ["Humayun's Tomb", "Taj Mahal", "Red Fort", "Qutub Minar"], answer: "Humayun's Tomb" },
  { image: gatewayOfIndia, question: "This Mumbai landmark is?", options: ["Gateway of India", "India Gate", "Marine Drive", "Victoria Terminus"], answer: "Gateway of India" },
  { image: charminar, question: "Name this Hyderabad monument.", options: ["Charminar", "Golconda Fort", "Mecca Masjid", "Falaknuma Palace"], answer: "Charminar" },
  { image: lotusTemple, question: "Which Delhi temple is this?", options: ["Lotus Temple", "Akshardham", "ISKCON Temple", "Birla Mandir"], answer: "Lotus Temple" },
  { image: kremlin, question: "Identify this Russian landmark.", options: ["Kremlin", "Red Square", "Hermitage", "Winter Palace"], answer: "Kremlin" },
  { image: neuschwanstein, question: "This fairytale castle is?", options: ["Neuschwanstein Castle", "Versailles", "Windsor Castle", "Edinburgh Castle"], answer: "Neuschwanstein Castle" },
  { image: towerBridge, question: "Which London bridge is this?", options: ["Tower Bridge", "London Bridge", "Golden Gate", "Brooklyn Bridge"], answer: "Tower Bridge" },
  { image: pantheon, question: "Name this Roman temple.", options: ["Pantheon", "Colosseum", "Parthenon", "Forum"], answer: "Pantheon" },
  { image: alhambra, question: "This Spanish palace is?", options: ["Alhambra", "Sagrada Familia", "La Rambla", "Prado"], answer: "Alhambra" },
  { image: buckingham, question: "Which palace is shown?", options: ["Buckingham Palace", "Windsor Castle", "Versailles", "Kensington Palace"], answer: "Buckingham Palace" },
  { image: versailles, question: "Name this French palace.", options: ["Palace of Versailles", "Louvre", "Notre Dame", "Elysee Palace"], answer: "Palace of Versailles" },
  { image: potala, question: "Identify this Tibetan palace.", options: ["Potala Palace", "Forbidden City", "Summer Palace", "Jokhang Temple"], answer: "Potala Palace" },
  { image: borobudur, question: "This Buddhist temple is?", options: ["Borobudur", "Angkor Wat", "Wat Arun", "Bagan"], answer: "Borobudur" },
  { image: terracotta, question: "These ancient sculptures are called?", options: ["Terracotta Army", "Stone Warriors", "Qin Statues", "Imperial Guards"], answer: "Terracotta Army" },
  { image: hagiaSophia, question: "Name this historic Istanbul landmark.", options: ["Hagia Sophia", "Blue Mosque", "Topkapi Palace", "Sultanahmet"], answer: "Hagia Sophia" },
];

export default quizData;

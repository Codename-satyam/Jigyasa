import virat from "./images/virat.jpg";
import elon from "./images/elon.jpg";
import gandhi from "./images/gandhi.jpg";
import naruto from "./images/naruto.jpg";
import messi from "./images/messi.jpg";
import ronaldo from "./images/ronaldo.jpg";
import einstein from "./images/einstein.jpg";
import apj from "./images/apj.jpg";
import modi from "./images/modi.jpg";
import tony from "./images/tony.jpg";
import goku from "./images/goku.jpg";
import taylor from "./images/taylor.jpg";
import dhoni from "./images/dhoni.jpg";
import bezos from "./images/bezos.jpg";
import newton from "./images/newton.jpg";
import sachin from "./images/sachin.jpg";
import luffy from "./images/luffy.jpg";
import neymar from "./images/neymar.jpg";
import bill from "./images/bill.jpg";
import obama from "./images/obama.jpg";
import thor from "./images/thor.jpg";
import nehra from "./images/nehru.jpg";
import bose from "./images/bose.jpg";
import pikachu from "./images/pikachu.jpg";
import rohit from "./images/rohit.jpg";
import zuckerberg from "./images/zuckerberg.jpg";
import tesla from "./images/tesla.jpg";
import mbappe from "./images/mbappe.jpg";

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
  // Characters & People - Achievements, Origins, and Hobbies
  { image: virat, question: "In which city did this cricket legend grow up and start his professional journey?", options: ["Mumbai", "Delhi", "Bengaluru", "Chennai"], answer: "Delhi" },
  { image: elon, question: "Which of these companies was NOT founded or co-founded by this tech mogul?", options: ["SpaceX", "Neuralink", "Amazon", "Tesla"], answer: "Amazon" },
  { image: gandhi, question: "Where did this iconic peacemaker study law before moving to South Africa?", options: ["London", "New York", "Mumbai", "Paris"], answer: "London" },
  { image: naruto, question: "Which 'Hokage' rank does this character eventually achieve in the series?", options: ["Fifth", "Sixth", "Seventh", "Fourth"], answer: "Seventh" },
  { image: messi, question: "At the age of 13, this football legend moved to which city to join a famous youth academy?", options: ["Madrid", "Barcelona", "Paris", "Manchester"], answer: "Barcelona" },
  { image: ronaldo, question: "Which Portuguese island is the birthplace of this football superstar?", options: ["Madeira", "Azores", "Lisbon", "Porto"], answer: "Madeira" },
  { image: einstein, question: "In which country was this genius of physics born?", options: ["USA", "Germany", "Switzerland", "Austria"], answer: "Germany" },
  { image: apj, question: "Before becoming President, what was the primary field of work for this 'Missile Man'?", options: ["Aerospace Engineering", "Civil Law", "Medicine", "Economics"], answer: "Aerospace Engineering" },
  { image: modi, question: "This leader served as the Chief Minister of which Indian state for over a decade?", options: ["Maharashtra", "Rajasthan", "Gujarat", "Madhya Pradesh"], answer: "Gujarat" },
  { image: tony, question: "What is the name of the AI assistant originally created by this billionaire genius?", options: ["JARVIS", "ALEXA", "SIRI", "CORTANA"], answer: "JARVIS" },
  { image: goku, question: "What is the name of the signature energy attack used by this character?", options: ["Rasengan", "Kamehameha", "Chidori", "Bankai"], answer: "Kamehameha" },
  { image: taylor, question: "This superstar's 2023 world tour became the highest-grossing tour of all time. What was it called?", options: ["The Eras Tour", "Red Tour", "Midnights Tour", "Reputation Tour"], answer: "The Eras Tour" },
  { image: dhoni, question: "In which Indian city did this legendary captain work as a railway ticket collector?", options: ["Ranchi", "Kharagpur", "Kolkata", "Patna"], answer: "Kharagpur" },
  { image: bezos, question: "What was the original name Jeff Bezos intended for 'Amazon'?", options: ["Cadabra", "Relentless", "EverythingStore", "AtoZ"], answer: "Cadabra" },
  { image: newton, question: "Which prestigious university was this physicist attending when he formulated the laws of motion?", options: ["Oxford", "Cambridge", "Harvard", "Princeton"], answer: "Cambridge" },
  { image: sachin, question: "Against which country did this 'God of Cricket' score his 100th international century?", options: ["Australia", "Pakistan", "Bangladesh", "South Africa"], answer: "Bangladesh" },
  { image: luffy, question: "What is the specific type of 'Devil Fruit' eaten by this character?", options: ["Gum-Gum Fruit", "Flame-Flame Fruit", "Shadow-Shadow Fruit", "Ice-Ice Fruit"], answer: "Gum-Gum Fruit" },
  { image: neymar, question: "This Brazilian wizard started his professional career at which famous club?", options: ["Santos", "Flamengo", "Palmeiras", "Corinthians"], answer: "Santos" },
  { image: bill, question: "What was the name of the first company founded by Bill Gates before Microsoft?", options: ["Traf-O-Data", "Micro-Soft", "Apple", "IBM Solutions"], answer: "Traf-O-Data" },
  { image: obama, question: "Before the White House, this leader served as a Senator for which US State?", options: ["New York", "Illinois", "California", "Hawaii"], answer: "Illinois" },
  { image: thor, question: "What is the name of the mythical realm that this 'God of Thunder' calls home?", options: ["Asgard", "Midgard", "Olympus", "Vanaheim"], answer: "Asgard" },
  { image: nehra, question: "Who was the first Prime Minister of India to hoist the national flag at Red Fort?", options: ["Jawaharlal Nehru", "Indira Gandhi", "Lal Bahadur Shastri", "Sardar Patel"], answer: "Jawaharlal Nehru" },
  { image: bose, question: "Which famous slogan is attributed to this fierce freedom fighter?", options: ["Jai Hind", "Do or Die", "Swaraj is my birthright", "Inquilab Zindabad"], answer: "Jai Hind" },
  { image: pikachu, question: "What specific type of 'stone' is required to evolve this electric companion?", options: ["Thunder Stone", "Fire Stone", "Water Stone", "Leaf Stone"], answer: "Thunder Stone" },
  { image: rohit, question: "This batsman holds the record for the highest individual score in ODIs. What is it?", options: ["264", "200", "183", "210"], answer: "264" },
  { image: zuckerberg, question: "In which University's dorm room was the first version of Facebook created?", options: ["Stanford", "Harvard", "MIT", "Yale"], answer: "Harvard" },
  { image: tesla, question: "Nikola Tesla was a major pioneer and proponent of which type of electrical current?", options: ["Direct Current (DC)", "Alternating Current (AC)", "Battery Power", "Solar Energy"], answer: "Alternating Current (AC)" },
  { image: mbappe, question: "Which World Cup final did this player score a hat-trick in?", options: ["2018 Russia", "2022 Qatar", "2014 Brazil", "2010 South Africa"], answer: "2022 Qatar" },

  // Monuments - History, Builders, and Locations
  { image: tajMahal, question: "Which chief architect is credited with the design of this marble wonder?", options: ["Ustad Ahmad Lahori", "Mirak Mirza Ghiyas", "Inayat Khan", "Bishan Das"], answer: "Ustad Ahmad Lahori" },
  { image: eiffelTower, question: "In which year was this Parisian icon completed for the World's Fair?", options: ["1889", "1901", "1850", "1920"], answer: "1889" },
  { image: statueOfLiberty, question: "On which specific island in New York Harbor does this statue stand?", options: ["Ellis Island", "Liberty Island", "Governor's Island", "Staten Island"], answer: "Liberty Island" },
  { image: colosseum, question: "What was the seating capacity of this ancient Roman amphitheater?", options: ["20,000", "50,000", "10,000", "100,000"], answer: "50,000" },
  { image: greatWall, question: "The most well-preserved sections of this wall were built during which dynasty?", options: ["Qin Dynasty", "Han Dynasty", "Ming Dynasty", "Tang Dynasty"], answer: "Ming Dynasty" },
  { image: christRedeemer, question: "This statue overlooks Rio de Janeiro from the peak of which mountain?", options: ["Sugarloaf", "Corcovado", "Andes", "Table Mountain"], answer: "Corcovado" },
  { image: petra, question: "Which ancient civilization established this city as their capital?", options: ["Romans", "Nabataeans", "Persians", "Egyptians"], answer: "Nabataeans" },
  { image: machuPicchu, question: "This 'Lost City' was rediscovered in 1911 by which explorer?", options: ["Hiram Bingham", "Marco Polo", "James Cook", "Vasco da Gama"], answer: "Hiram Bingham" },
  { image: pyramids, question: "Which of the three Giza pyramids is the oldest and largest?", options: ["Khufu", "Khafre", "Menkaure", "Djoser"], answer: "Khufu" },
  { image: sydneyOperaHouse, question: "Which Danish architect won the competition to design this masterpiece?", options: ["Jørn Utzon", "Frank Gehry", "Zaha Hadid", "Renzo Piano"], answer: "Jørn Utzon" },
  { image: bigBen, question: "What does the name 'Big Ben' actually refer to?", options: ["The Clock Tower", "The Great Bell", "The Clock Face", "The Building"], answer: "The Great Bell" },
  { image: burjKhalifa, question: "How many floors are there in this tallest building in the world?", options: ["163", "120", "200", "150"], answer: "163" },
  { image: qutubMinar, question: "Which Sultan added the fifth and final floor to this minaret?", options: ["Iltutmish", "Alauddin Khilji", "Firoz Shah Tughlaq", "Balban"], answer: "Firoz Shah Tughlaq" },
  { image: redFort, question: "The Prime Minister of India addresses the nation from which part of this fort on Independence Day?", options: ["Lahori Gate", "Delhi Gate", "Diwan-i-Aam", "Moti Masjid"], answer: "Lahori Gate" },
  { image: angkorWat, question: "This massive temple complex was originally dedicated to which Hindu deity?", options: ["Shiva", "Vishnu", "Brahma", "Ganesh"], answer: "Vishnu" },
  { image: chichenItza, question: "What phenomenon occurs on the El Castillo pyramid during the equinoxes?", options: ["Shadow of a Serpent", "Sun alignment with door", "Eclipse", "Color change"], answer: "Shadow of a Serpent" },
  { image: mountRushmore, question: "Which of these Presidents is NOT featured on this mountain?", options: ["George Washington", "Abraham Lincoln", "Franklin D. Roosevelt", "Theodore Roosevelt"], answer: "Franklin D. Roosevelt" },
  { image: acropolis, question: "The Acropolis is located in Athens, but what does the word 'Acropolis' mean in Greek?", options: ["High City", "Holy City", "Fortress", "Marketplace"], answer: "High City" },
  { image: parthenon, question: "The Parthenon was built using which classical order of Greek architecture?", options: ["Doric", "Ionic", "Corinthian", "Composite"], answer: "Doric" },
  { image: forbiddenCity, question: "This imperial palace served as the home for emperors of which two dynasties?", options: ["Ming and Qing", "Han and Tang", "Song and Yuan", "Qin and Han"], answer: "Ming and Qing" },
  { image: goldenGate, question: "The distinctive orange color of this bridge is officially known as what?", options: ["International Orange", "Sunset Red", "Pacific Gold", "Neon Orange"], answer: "International Orange" },
  { image: leaningTower, question: "Construction of this tower was halted for 100 years due to what reason?", options: ["Wars", "Lack of Funds", "Earthquakes", "Soil settling"], answer: "Wars" },
  { image: louvre, question: "Who commissioned the famous glass pyramid at the entrance of the Louvre?", options: ["François Mitterrand", "Napoleon", "Charles de Gaulle", "Louis XIV"], answer: "François Mitterrand" },
  { image: stonehenge, question: "The massive stones of Stonehenge are believed to have been transported from where?", options: ["Wales", "Scotland", "Ireland", "France"], answer: "Wales" },
  { image: sagradaFamilia, question: "Which famous architect is buried in the crypt of this unfinished basilica?", options: ["Antoni Gaudí", "Salvador Dalí", "Pablo Picasso", "Joan Miró"], answer: "Antoni Gaudí" },
  { image: humayunTomb, question: "Who was the wife of Humayun who commissioned this tomb?", options: ["Bega Begum", "Mumtaz Mahal", "Nur Jahan", "Jodha Bai"], answer: "Bega Begum" },
  { image: gatewayOfIndia, question: "This monument was built to commemorate the 1911 visit of which British monarch?", options: ["King George V", "Queen Victoria", "King Edward VII", "King George VI"], answer: "King George V" },
  { image: charminar, question: "On which river's bank is the city of Hyderabad and the Charminar located?", options: ["Musi River", "Krishna River", "Godavari River", "Tapti River"], answer: "Musi River" },
  { image: lotusTemple, question: "This flower-shaped temple belongs to which modern religion?", options: ["Baháʼí Faith", "Buddhism", "Jainism", "Sikhism"], answer: "Baháʼí Faith" },
  { image: kremlin, question: "The Kremlin serves as the official residence of the President of which country?", options: ["Russia", "Ukraine", "Poland", "Belarus"], answer: "Russia" },
  { image: neuschwanstein, question: "In which German state is this fairytale castle located?", options: ["Bavaria", "Saxony", "Berlin", "Hesse"], answer: "Bavaria" },
  { image: towerBridge, question: "Which famous London bridge is often mistakenly called 'London Bridge' by tourists?", options: ["Tower Bridge", "Westminster Bridge", "Waterloo Bridge", "Millennium Bridge"], answer: "Tower Bridge" },
  { image: pantheon, question: "The Pantheon is famous for having the world's largest unreinforced concrete what?", options: ["Dome", "Pillar", "Arch", "Wall"], answer: "Dome" },
  { image: alhambra, question: "In which Spanish city can you find this Moorish palace?", options: ["Granada", "Madrid", "Seville", "Barcelona"], answer: "Granada" },
  { image: buckingham, question: "Which monarch was the first to make Buckingham Palace their official residence?", options: ["Queen Victoria", "King George III", "Queen Elizabeth I", "King Henry VIII"], answer: "Queen Victoria" },
  { image: versailles, question: "The famous 'Hall of Mirrors' is located in which palace?", options: ["Versailles", "Louvre", "Potala", "Buckingham"], answer: "Versailles" },
  { image: potala, question: "The Potala Palace was the winter residence of which spiritual leader until 1959?", options: ["Dalai Lama", "Panchen Lama", "Guru Rinpoche", "Karmapa"], answer: "Dalai Lama" },
  { image: borobudur, question: "In which country is this largest Buddhist temple in the world located?", options: ["Indonesia", "Thailand", "Vietnam", "Cambodia"], answer: "Indonesia" },
  { image: terracotta, question: "The Terracotta Army was built to protect the tomb of which First Emperor?", options: ["Qin Shi Huang", "Kublai Khan", "Sun Yat-sen", "Han Wudi"], answer: "Qin Shi Huang" },
  { image: hagiaSophia, question: "The massive dome of Hagia Sophia is supported by which architectural elements?", options: ["Pendentives", "Flying Buttresses", "Corbels", "Columns"], answer: "Pendentives" }
];
export default quizData;
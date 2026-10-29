// The Middle Ages: 14 topics from the fall of Rome to the printing press, 20 variants each (280). Each topic takes turns
// between its own questions (each with the reason it's right), the year of one of its events, the century of one, and
// which of four events came first or last on the whole timeline. Original questions; every date is the usual one in
// school histories.
import { bank } from '../kit/bank.js';

// each event: its year, the question's words after "In what year…" / "In which century…", and how it reads in a list
const E = (y, ask, label) => ({ y, ask, label });
// each topic: its own questions as [question, answer, [wrong answers], why], and its events
export const TOPICS = [
  { name: 'The fall of Rome and the Byzantine Empire', events: [E(476, 'did the last emperor of the Western Roman Empire lose his throne', 'The last Western Roman emperor is deposed'), E(537, 'was the Hagia Sophia in Constantinople finished', 'The Hagia Sophia is finished')], facts: [
    ['Who removed Romulus Augustulus, the last emperor of the Western Roman Empire, in 476?', 'Odoacer', ['Attila the Hun', 'Charlemagne', 'Justinian', 'Clovis'], 'Odoacer, a Germanic general, deposed him in 476, the date usually given for the end of the Western Roman Empire and the start of the Middle Ages.'],
    ['What was the capital of the Byzantine (Eastern Roman) Empire?', 'Constantinople', ['Rome', 'Athens', 'Alexandria', 'Jerusalem'], 'Constantinople, today’s Istanbul, was founded by Constantine on the old town of Byzantium, which gave the empire its later name.'],
    ['Which Byzantine emperor had Roman law collected into one code and built the Hagia Sophia?', 'Justinian', ['Constantine', 'Augustus', 'Charlemagne', 'Basil II'], 'Justinian (ruled 527–565) had Roman law gathered into the Code of Justinian, which later shaped law across Europe, and finished the Hagia Sophia in 537.'],
    ['Roughly which years does “the Middle Ages” mean in European history?', 'From the fall of Rome in 476 to about 1500', ['From 1066 to 1215', 'From the birth of Rome to its fall', 'From about 1500 to 1800', 'From 1000 BC to AD 476'], 'The Middle Ages run from the fall of the Western Roman Empire (476) to about 1500, between the ancient world and the modern one.'],
    ['Why did the Eastern half of the Roman Empire last about 1,000 years longer than the Western half?', 'It was richer, and its capital was well defended by walls and the sea', ['It had no enemies at all', 'The Vikings defended it', 'It was ruled by the pope', 'It moved its capital to Rome'], 'The East had richer cities and more taxes to pay armies, and Constantinople’s huge walls and seas held off attackers until 1453.'],
  ] },
  { name: 'The Franks and Charlemagne', events: [E(732, 'was the Battle of Tours fought', 'The Battle of Tours'), E(800, 'was Charlemagne crowned emperor', 'Charlemagne is crowned emperor'), E(843, 'was the Treaty of Verdun signed', 'The Treaty of Verdun')], facts: [
    ['Who crowned Charlemagne emperor on Christmas Day, 800?', 'Pope Leo III', ['Pope Urban II', 'Pope Gregory VII', 'The Byzantine emperor', 'Clovis'], 'Pope Leo III crowned him in Rome, making him the first emperor in the West since 476.'],
    ['Which people did Charlemagne rule as king?', 'The Franks', ['The Vikings', 'The Normans', 'The Byzantines', 'The Moors'], 'Charlemagne was king of the Franks, whose kingdom grew into an empire covering much of today’s France, Germany and Italy.'],
    ['Who led the Franks when they stopped an Umayyad army at the Battle of Tours in 732?', 'Charles Martel', ['Charlemagne', 'Clovis', 'William the Conqueror', 'Rollo'], 'Charles Martel, Charlemagne’s grandfather, won at Tours (or Poitiers) in 732.'],
    ['What did the Treaty of Verdun (843) do?', 'Split Charlemagne’s empire among his three grandsons', ['Made Charlemagne emperor', 'Ended the Hundred Years’ War', 'Started the First Crusade', 'Limited the power of the English king'], 'Charlemagne’s grandsons split his empire in three, roughly into the lands that became France, Germany and a middle strip between them.'],
    ['What was the Carolingian Renaissance?', 'A revival of learning, schools and copying books under Charlemagne', ['A plague that swept through France', 'A wave of Viking raids', 'A new kind of castle', 'A revolt of peasants'], 'Charlemagne gathered scholars like Alcuin, set up schools and had old books copied in a clear new script.'],
  ] },
  { name: 'The rise of Islam', events: [E(622, 'did Muhammad move from Mecca to Medina (the Hijra)', 'The Hijra'), E(762, 'was Baghdad founded', 'Baghdad is founded')], facts: [
    ['In which city was the Prophet Muhammad born?', 'Mecca', ['Medina', 'Jerusalem', 'Baghdad', 'Damascus'], 'Muhammad was born in Mecca, in Arabia, around 570.'],
    ['What was the Hijra of 622?', 'Muhammad’s move from Mecca to Medina, where the Islamic calendar starts', ['The first crusade', 'The founding of Baghdad', 'The fall of Constantinople', 'The building of the Hagia Sophia'], 'In 622 Muhammad and his followers moved from Mecca to Medina; the Islamic calendar counts its years from then.'],
    ['What was the House of Wisdom in Baghdad?', 'A center of learning where scholars translated and studied Greek, Persian and Indian works', ['The main mosque in Mecca', 'A palace in Spain', 'A fortress against the crusaders', 'A market for spices'], 'Under the Abbasids, scholars in Baghdad translated and built on ancient learning in mathematics, astronomy and medicine.'],
    ['Which number system reached Europe through Arabic scholars?', 'The Hindu–Arabic numerals, 0 to 9', ['Roman numerals', 'Greek numerals', 'Babylonian numbers', 'Egyptian hieroglyphs'], 'The digits 0–9 came from India and spread to Europe through Arabic writers, replacing Roman numerals for arithmetic.'],
    ['Which caliphate made Baghdad its capital?', 'The Abbasid Caliphate', ['The Umayyad Caliphate', 'The Ottoman Empire', 'The Fatimid Caliphate', 'The Mali Empire'], 'The Abbasids took over from the Umayyads (whose capital was Damascus) and founded Baghdad in 762.'],
  ] },
  { name: 'The Vikings', events: [E(793, 'did Vikings raid the monastery of Lindisfarne', 'The Viking raid on Lindisfarne'), E(911, 'was Rollo given the land that became Normandy', 'Rollo is given Normandy')], facts: [
    ['Where was the Viking raid of 793 that is often called the start of the Viking Age?', 'Lindisfarne', ['Hastings', 'Canterbury', 'Paris', 'Rome'], 'Vikings attacked the monastery on the island of Lindisfarne, off northeast England, in 793.'],
    ['Where did the Vikings come from?', 'Scandinavia: Norway, Denmark and Sweden', ['Normandy', 'Ireland', 'North Africa', 'Hungary'], 'The Vikings were seafarers from Scandinavia who raided, traded and settled across Europe.'],
    ['Which Viking reached North America around the year 1000?', 'Leif Erikson', ['Erik the Red', 'Harald Hardrada', 'Rollo', 'Cnut'], 'Leif Erikson, son of Erik the Red (who settled Greenland), reached Vinland in North America about 500 years before Columbus.'],
    ['What made Viking longships so useful for raiding?', 'They could cross open seas and also sail up shallow rivers', ['They were armored with iron', 'They had cannons', 'They needed no crew', 'They were too big to sink'], 'Longships were light with a shallow keel, so raiders could cross the North Sea and row far inland up rivers.'],
    ['Whose followers, descended from Vikings, gave Normandy (“land of the Northmen”) its name?', 'Rollo’s', ['Charlemagne’s', 'Alfred the Great’s', 'Leif Erikson’s', 'Saladin’s'], 'In 911 the French king gave the Viking leader Rollo land in northern France, which became Normandy.'],
  ] },
  { name: 'Feudalism and the manor', events: [], facts: [
    ['Under feudalism, what was a fief?', 'Land a lord gave to a vassal in return for loyalty and service', ['A tax paid to the Church', 'A kind of castle', 'A weapon used by knights', 'A town’s charter'], 'A fief was land granted by a lord; the vassal who held it owed loyalty and, usually, military service.'],
    ['Who were serfs?', 'Peasants bound to a lord’s land, who could not leave without permission', ['Knights who guarded the king', 'Merchants in a guild', 'Monks who copied books', 'Nobles who owned castles'], 'Serfs farmed the lord’s land and their own strips, owed him labor and dues, and were tied to the manor.'],
    ['What did a knight owe his lord in return for land?', 'Military service', ['A tenth of his crops', 'Nothing at all', 'Rent paid in gold', 'Work in the fields'], 'Knights held land in return for fighting for their lord, often about 40 days a year.'],
    ['What was a manor?', 'A lord’s estate: his house, the village, its fields and the people who worked them', ['A church school', 'A king’s army', 'A market town', 'A ship'], 'The manor was the center of country life: the lord’s house, the peasants’ village, fields, mill and church.'],
    ['Who was at the top of the feudal system?', 'The king', ['The serfs', 'The knights', 'The merchants', 'The barons'], 'The king granted land to great lords (barons), who granted land to knights, with peasants at the bottom.'],
    ['What did a young noble serve as, on the way to becoming a knight?', 'A page, then a squire', ['An apprentice, then a journeyman', 'A monk, then a priest', 'A serf, then a vassal', 'A herald, then a baron'], 'Boys of noble families served as pages in a lord’s household, then as squires to a knight, and were knighted at about 21.'],
    ['What was chivalry?', 'The code knights were meant to live by: bravery, loyalty, and protecting the weak', ['A tax on knights', 'A kind of armor', 'The training of monks', 'A law limiting the king'], 'Chivalry was the ideal of how a knight should behave, shaped by the Church and by songs and stories of the time.'],
    ['How did most people in medieval Europe make a living?', 'By farming', ['By trading overseas', 'By working in factories', 'By fighting as knights', 'By working for the Church'], 'Around nine in ten people were peasants who farmed, many of them on a lord’s manor.'],
    ['What was the main thing that held feudal society together?', 'Promises of loyalty in exchange for land and protection', ['Money paid in wages', 'Elections every year', 'A written constitution', 'Trade between towns'], 'Feudalism was a chain of personal promises: protection and land from above, loyalty and service from below.'],
  ] },
  { name: 'The medieval Church', events: [E(1054, 'did the Great Schism split the Church', 'The Great Schism'), E(1077, 'did Emperor Henry IV wait in the snow at Canossa', 'Henry IV at Canossa')], facts: [
    ['What happened in the Great Schism of 1054?', 'The Church split into the Roman Catholic Church in the west and the Eastern Orthodox Church in the east', ['England left the Catholic Church', 'The pope moved to Avignon', 'The crusaders took Jerusalem', 'The Vikings became Christian'], 'Arguments over the pope’s authority and church practice split the Church into Catholic and Orthodox in 1054.'],
    ['What was excommunication?', 'Being cut off from the Church and its sacraments', ['Being made a knight', 'Paying a tenth of your crops', 'Going on a pilgrimage', 'Becoming a monk'], 'Excommunication shut a person out of the Church, a powerful threat when people believed it put their soul at risk.'],
    ['What did monks do in monasteries?', 'Prayed, worked, and copied books by hand', ['Collected taxes for the king', 'Trained soldiers', 'Ran the guilds', 'Built ships'], 'Following rules like Saint Benedict’s, monks lived by prayer and work, and kept learning alive by copying books.'],
    ['What was a tithe?', 'A tenth of what people produced, given to the Church', ['A lord’s castle', 'A knight’s weapon', 'A crusade', 'A kind of prayer book'], 'Everyone was expected to give the Church a tithe, one tenth of their crops or income.'],
    ['What was the Investiture Controversy about?', 'Whether popes or kings had the right to appoint bishops', ['Who should rule England', 'How to fight the plague', 'Where to build cathedrals', 'Who owned the Hagia Sophia'], 'Pope Gregory VII and Emperor Henry IV clashed over appointing bishops; Henry begged forgiveness at Canossa in 1077.'],
  ] },
  { name: 'The Norman Conquest', events: [E(1066, 'was the Battle of Hastings fought', 'The Battle of Hastings'), E(1086, 'was the Domesday Book made', 'The Domesday Book')], facts: [
    ['Who won the Battle of Hastings in 1066?', 'William, Duke of Normandy', ['Harold Godwinson', 'Harald Hardrada', 'Alfred the Great', 'Edward the Confessor'], 'William of Normandy defeated King Harold and became William I, “the Conqueror”.'],
    ['Which English king was killed at the Battle of Hastings?', 'Harold II (Harold Godwinson)', ['Edward the Confessor', 'William I', 'Richard I', 'King John'], 'Harold II had just beaten a Norwegian invasion at Stamford Bridge before marching south, where he was killed at Hastings.'],
    ['What was the Domesday Book (1086)?', 'A survey of land and property across England, ordered by William I', ['A book of laws for the Church', 'A list of crusaders', 'A chronicle of the Black Death', 'The first printed book'], 'William had his new kingdom surveyed so he knew who owned what and how much tax it could pay.'],
    ['What did the Normans build to control England after 1066?', 'Castles, first motte-and-bailey castles', ['Universities', 'Canals', 'Printing presses', 'Lighthouses'], 'Quick earth-and-timber motte-and-bailey castles, later rebuilt in stone, let a few Normans hold down the country.'],
    ['Which embroidered cloth tells the story of the Norman Conquest?', 'The Bayeux Tapestry', ['The Book of Kells', 'Magna Carta', 'The Domesday Book', 'The Hagia Sophia'], 'The Bayeux Tapestry, about 70 meters long, shows the events leading up to and including the Battle of Hastings.'],
  ] },
  { name: 'The Crusades', events: [E(1095, 'did Pope Urban II call the First Crusade', 'Urban II calls the First Crusade'), E(1099, 'did the crusaders capture Jerusalem', 'Crusaders capture Jerusalem'), E(1187, 'did Saladin retake Jerusalem', 'Saladin retakes Jerusalem'), E(1204, 'did the Fourth Crusade sack Constantinople', 'The Fourth Crusade sacks Constantinople')], facts: [
    ['Which pope called the First Crusade in 1095?', 'Urban II', ['Leo III', 'Gregory VII', 'Innocent III', 'Gregory I'], 'At Clermont in 1095, Urban II called on Christians to take Jerusalem and help the Byzantine Empire.'],
    ['Who retook Jerusalem for the Muslims in 1187?', 'Saladin', ['Mehmed II', 'Genghis Khan', 'Mansa Musa', 'Charles Martel'], 'Saladin, sultan of Egypt and Syria, defeated the crusaders at Hattin and took Jerusalem in 1187.'],
    ['Which English king led the Third Crusade?', 'Richard I, the Lionheart', ['King John', 'William I', 'Henry V', 'Edward I'], 'Richard the Lionheart fought Saladin in the Third Crusade (1189–1192) but did not retake Jerusalem.'],
    ['What did the Fourth Crusade attack in 1204?', 'Constantinople, a Christian city', ['Jerusalem', 'Mecca', 'Cairo', 'Rome'], 'Short of money, the Fourth Crusade turned on Constantinople and sacked it, badly weakening the Byzantine Empire.'],
    ['What was one lasting result of the Crusades?', 'More trade between Europe and the Middle East, bringing new goods and ideas west', ['The end of the Byzantine Empire in 1099', 'The Black Death', 'The end of feudalism', 'Christian rule of Jerusalem to this day'], 'Crusaders and merchants brought back spices, silk and knowledge, and Italian trading cities grew rich.'],
  ] },
  { name: 'Magna Carta and the power of kings', events: [E(1215, 'did King John agree to Magna Carta', 'Magna Carta'), E(1295, 'did Edward I call the Model Parliament', 'The Model Parliament')], facts: [
    ['Which English king agreed to Magna Carta in 1215?', 'King John', ['Richard I', 'William I', 'Henry II', 'Edward I'], 'King John, short of money and losing wars in France, was forced to agree to Magna Carta.'],
    ['Who forced King John to agree to Magna Carta?', 'His barons, the great nobles', ['The pope', 'The French king', 'The peasants', 'The Vikings'], 'Rebel barons angry at his taxes and rule made John seal Magna Carta at Runnymede.'],
    ['What was the big idea of Magna Carta?', 'Even the king had to obey the law', ['The pope ruled England', 'Everyone could vote', 'Serfs were set free', 'Taxes were banned'], 'Magna Carta said the king could not take property or punish free men except by law, an idea that grew into the rule of law.'],
    ['Where was Magna Carta sealed?', 'Runnymede, by the River Thames', ['Hastings', 'Canterbury Cathedral', 'The Tower of London', 'Westminster Abbey'], 'King John met the barons in the meadow at Runnymede, near Windsor, in June 1215.'],
    ['What grew out of English kings needing to ask for taxes?', 'Parliament', ['The guilds', 'The Crusades', 'The monasteries', 'The Domesday Book'], 'Kings called meetings of nobles, clergy and townspeople to agree to taxes; these grew into Parliament.'],
  ] },
  { name: 'Towns, guilds and learning', events: [E(1088, 'was the University of Bologna founded', 'The University of Bologna is founded'), E(1163, 'was work begun on Notre-Dame in Paris', 'Work begins on Notre-Dame')], facts: [
    ['What was a guild?', 'An association of merchants or craftsmen that set prices, quality and training', ['A kind of church tax', 'A castle’s outer wall', 'A peasant’s strip of land', 'A royal army'], 'Guilds controlled a trade in a town: who could work in it, how goods were made, and what they cost.'],
    ['What were the stages of training in a craft guild?', 'Apprentice, then journeyman, then master', ['Page, then squire, then knight', 'Serf, then baron, then king', 'Monk, then bishop, then pope', 'Student, then doctor, then lord'], 'An apprentice learned from a master, worked as a journeyman, and could become a master by making a “masterpiece”.'],
    ['Which style of cathedral has pointed arches, flying buttresses and huge stained-glass windows?', 'Gothic', ['Romanesque', 'Baroque', 'Classical Greek', 'Modern'], 'Gothic builders used pointed arches and flying buttresses to carry the weight, so walls could be tall and full of glass.'],
    ['Which is often called the oldest university in Europe still running?', 'The University of Bologna', ['The University of Oxford', 'The House of Wisdom', 'The Sorbonne in Paris', 'Cambridge'], 'Bologna, in Italy, is traditionally dated to 1088.'],
    ['Which scholar tried to show that Christian faith and the ideas of Aristotle fit together?', 'Thomas Aquinas', ['Charlemagne', 'Marco Polo', 'Johannes Gutenberg', 'Wat Tyler'], 'Thomas Aquinas, in the 1200s, used reason and Aristotle’s philosophy to explain Christian beliefs.'],
  ] },
  { name: 'The Black Death', events: [E(1347, 'did the Black Death reach Europe', 'The Black Death reaches Europe'), E(1381, 'did the Peasants’ Revolt break out in England', 'The Peasants’ Revolt')], facts: [
    ['What was the Black Death?', 'A plague that killed perhaps a third or more of Europe’s people', ['A long winter with no harvest', 'A war between England and France', 'A Viking invasion', 'A split in the Church'], 'The plague, now known to be caused by bacteria (bubonic plague), killed tens of millions between 1347 and about 1351.'],
    ['How did the plague spread?', 'By fleas carried on rats, and from person to person', ['Through bad smells only', 'By eating fish', 'Only through drinking water', 'By sunlight'], 'Fleas on black rats carried it along trade routes and ships, and the pneumonic form spread through coughing.'],
    ['Why did wages rise after the Black Death?', 'So many workers had died that workers were scarce', ['Kings printed more money', 'The Church paid everyone', 'There were too many workers', 'Taxes were banned'], 'With fewer people to farm the land, surviving peasants could demand more pay and more freedom.'],
    ['What was the English Peasants’ Revolt of 1381 against?', 'A new poll tax, and limits on wages and freedom', ['The Norman Conquest', 'The pope', 'The Black Death itself', 'Magna Carta'], 'Angry at a poll tax and laws holding wages down, peasants marched on London in 1381.'],
    ['Who led the Peasants’ Revolt of 1381?', 'Wat Tyler', ['Joan of Arc', 'Thomas Aquinas', 'William the Conqueror', 'Robin Hood'], 'Wat Tyler led the rebels to London, where he was killed while meeting the young King Richard II.'],
  ] },
  { name: 'The Hundred Years’ War', events: [E(1337, 'did the Hundred Years’ War begin', 'The Hundred Years’ War begins'), E(1415, 'was the Battle of Agincourt fought', 'The Battle of Agincourt'), E(1429, 'did Joan of Arc lift the siege of Orléans', 'Joan of Arc lifts the siege of Orléans'), E(1453, 'did the Hundred Years’ War end', 'The Hundred Years’ War ends')], facts: [
    ['Which two kingdoms fought the Hundred Years’ War?', 'England and France', ['England and Scotland', 'France and Spain', 'England and Spain', 'France and the Holy Roman Empire'], 'English kings claimed the French throne, and the two kingdoms fought on and off from 1337 to 1453.'],
    ['Who was the French peasant girl who helped lift the siege of Orléans in 1429?', 'Joan of Arc', ['Eleanor of Aquitaine', 'Christine de Pizan', 'Queen Isabella', 'Saint Catherine'], 'Joan of Arc, guided (she said) by saints’ voices, inspired the French to victory; she was burned by the English in 1431.'],
    ['Which weapon won English victories at Crécy and Agincourt?', 'The longbow', ['The cannon', 'The musket', 'The catapult', 'The crossbow'], 'English longbowmen could shoot fast and far, cutting down charging French knights.'],
    ['How long did the Hundred Years’ War really last?', '116 years, from 1337 to 1453', ['Exactly 100 years', '30 years', '50 years', '200 years'], 'It ran from 1337 to 1453: 116 years, with long truces in between.'],
    ['Which English king won the Battle of Agincourt in 1415?', 'Henry V', ['Henry VIII', 'Richard I', 'Edward I', 'William I'], 'Henry V’s small, tired army beat a much bigger French one at Agincourt.'],
  ] },
  { name: 'The end of the Middle Ages', events: [E(1453, 'did the Ottomans capture Constantinople', 'The Ottomans capture Constantinople'), E(1492, 'did Granada fall, ending the Reconquista', 'Granada falls')], facts: [
    ['Which invention by Johannes Gutenberg, around 1450, spread books and ideas quickly?', 'The printing press with movable type', ['The telescope', 'The compass', 'Paper', 'The mechanical clock'], 'Gutenberg’s press could print hundreds of copies of a book, so ideas spread far faster than by hand-copying.'],
    ['Who captured Constantinople in 1453, ending the Byzantine Empire?', 'The Ottoman Turks, led by Mehmed II', ['The crusaders', 'The Mongols', 'The Vikings', 'The Venetians'], 'Sultan Mehmed II’s cannons broke the walls in 1453, and Constantinople became the Ottoman capital, Istanbul.'],
    ['What ended in 1492 when Granada fell?', 'The Reconquista, the Christian reconquest of Spain', ['The Hundred Years’ War', 'The Black Death', 'The Crusades', 'The Viking Age'], 'Ferdinand and Isabella took Granada, the last Muslim kingdom in Spain, in 1492.'],
    ['Which movement, starting in Italy, brought new interest in Greek and Roman art and learning?', 'The Renaissance', ['The Reconquista', 'Feudalism', 'The Great Schism', 'The Crusades'], 'The Renaissance (“rebirth”) began in Italian cities in the 1300s and spread across Europe, marking the move to the modern age.'],
    ['Why is 1453 often given as a date for the end of the Middle Ages?', 'Constantinople fell and the Hundred Years’ War ended that year', ['Magna Carta was signed', 'The Black Death began', 'Charlemagne was crowned', 'The Vikings raided Lindisfarne'], 'In 1453 the last of the Roman Empire fell with Constantinople, and the Hundred Years’ War ended.'],
  ] },
  { name: 'The wider medieval world', events: [E(1192, 'did Minamoto Yoritomo become shogun of Japan', 'Minamoto Yoritomo becomes shogun'), E(1206, 'was Genghis Khan proclaimed ruler of the Mongols', 'Genghis Khan rules the Mongols'), E(1324, 'did Mansa Musa make his pilgrimage to Mecca', 'Mansa Musa’s pilgrimage to Mecca'), E(1325, 'did the Aztecs found Tenochtitlan', 'The Aztecs found Tenochtitlan')], facts: [
    ['Which ruler of Mali was famous for his great wealth and his pilgrimage to Mecca in 1324?', 'Mansa Musa', ['Sundiata', 'Saladin', 'Kublai Khan', 'Mehmed II'], 'Mansa Musa of Mali traveled to Mecca with so much gold that he lowered its price in Cairo.'],
    ['Who united the Mongol tribes and founded the Mongol Empire?', 'Genghis Khan', ['Kublai Khan', 'Attila the Hun', 'Tamerlane', 'Saladin'], 'Genghis Khan united the Mongols in 1206; his empire became the largest connected land empire in history.'],
    ['In medieval Japan, what was the title of the military ruler who held the real power?', 'Shogun', ['Emperor', 'Samurai', 'Daimyo', 'Khan'], 'From 1192 the shogun ruled, while the emperor stayed on as a ceremonial figure; samurai were the warriors who served lords.'],
    ['Which Chinese dynasty (960–1279) is known for movable type and using the compass at sea?', 'The Song dynasty', ['The Han dynasty', 'The Qin dynasty', 'The Ming dynasty', 'The Zhou dynasty'], 'Song China was rich in trade and invention, from movable type to paper money and the magnetic compass.'],
    ['Which city did the Aztecs build on an island in a lake, traditionally in 1325?', 'Tenochtitlan', ['Cuzco', 'Timbuktu', 'Machu Picchu', 'Chichen Itza'], 'Tenochtitlan, on Lake Texcoco, grew into one of the largest cities in the world; Mexico City stands there today.'],
    ['Which Venetian traveler wrote about China under Kublai Khan?', 'Marco Polo', ['Ibn Battuta', 'Leif Erikson', 'Christopher Columbus', 'Vasco da Gama'], 'Marco Polo’s account of his years in China in the late 1200s amazed European readers.'],
  ] },
];

const TIMELINE = TOPICS.flatMap((t) => t.events);
const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const century = (y) => Math.floor((y - 1) / 100) + 1;
const choice = (d, right, wrong) => {
  const all = d.shuffle([right, ...wrong.slice(0, 4)]);
  return { kind: 'choice', choices: all, correct: all.indexOf(right) };
};
// years near the right one: other events' years within a few centuries, then round steps away, all at least 5 years
// from the answer and from each other (so no choice is a near miss of another)
function nearYears(d, y) {
  const out = [], fits = (x) => x > 300 && x < 1600 && [y, ...out].every((o) => Math.abs(o - x) >= 5);
  for (const x of d.shuffle([...new Set(TIMELINE.map((e) => e.y))].filter((x) => Math.abs(x - y) <= 300))) if (out.length < 4 && fits(x)) out.push(x);
  for (const step of [d.pick([20, 30, 40]), 50, 100, 150, 200]) for (const x of [y - step, y + step]) if (out.length < 4 && fits(x)) out.push(x);
  return out;
}

// a topic's turns: its own question, the year of one of its events, its century, then which of four came first or last
// (a topic without dates, like feudalism, only asks its own questions)
const templates = TOPICS.map((topic) => (d, ctx) => {
  const kinds = topic.events.length ? ['fact', 'year', 'century', 'order'] : ['fact'];
  const kind = kinds[ctx.k % kinds.length], turn = Math.floor(ctx.k / kinds.length);
  const base = { topic: topic.name };
  if (kind === 'fact') {
    const [q, right, wrong, why] = topic.facts[turn % topic.facts.length];
    return { ...base, text: q, answer: choice(d, right, wrong), solution: `${why} The answer is <b>${right}</b>.` };
  }
  const event = topic.events[turn % topic.events.length];
  if (kind === 'year') {
    const years = [event.y, ...nearYears(d, event.y)].sort((a, b) => a - b);
    const others = TIMELINE.filter((e) => e !== event && e.y !== event.y).sort((a, b) => Math.abs(a.y - event.y) - Math.abs(b.y - event.y))[0];
    return { ...base, text: `In what year ${event.ask}?`, tip: 'Place it in its century first, then think which events on the timeline came just before and after it.', answer: { kind: 'choice', choices: years.map(String), correct: years.indexOf(event.y) },
      solution: `${event.label} came in the ${ordinal(century(event.y))} century. The closest other date here is ${others.y} (${others.label}), ${Math.abs(others.y - event.y)} years ${others.y < event.y ? 'before' : 'after'}. The year was <b>${event.y}</b>.` };
  }
  if (kind === 'century') {
    const c = century(event.y), from = Math.max(5, Math.min(c - d.int(1, 3), 11)), list = [0, 1, 2, 3, 4].map((i) => from + i);
    const rule = event.y % 100 === 0 ? `A year ending in 00 is the last year of its century, so ${event.y} closes the ${ordinal(c)} century` : `The century is one more than the hundreds: ${Math.floor(event.y / 100)} + 1 = ${c}`;
    return { ...base, text: `In which century ${event.ask}?`, answer: { kind: 'choice', choices: list.map((x) => `The ${ordinal(x)} century`), correct: list.indexOf(c) },
      tip: 'Remember the year first, then add one to its hundreds (1776 → 17 + 1, the 18th century).',
      solution: `${event.label} came in ${event.y}. ${rule}. So it was <b>the ${ordinal(c)} century</b>, the years ${(c - 1) * 100 + 1} to ${c * 100}.` };
  }
  // order: one of this topic's events against three others, all at least 15 years apart
  const own = topic.events[turn % topic.events.length], picked = [own];
  for (const e of d.shuffle(TIMELINE)) if (picked.length < 4 && picked.every((p) => Math.abs(p.y - e.y) >= 15)) picked.push(e);
  const first = d.chance(0.5), sorted = picked.slice().sort((a, b) => a.y - b.y), right = first ? sorted[0] : sorted[3];
  const shown = d.shuffle(picked);
  return { ...base, text: `Which of these happened ${first ? 'first' : 'last'}?`, answer: { kind: 'choice', choices: shown.map((e) => e.label), correct: shown.indexOf(right) },
    tip: 'Put each event in its century first, then compare the ones in the same century.',
    solution: `In order: ${sorted.map((e) => `${e.label} (${e.y})`).join(', ')}. So the ${first ? 'first' : 'last'} was <b>${right.label}</b>.` };
});
export const middleAges = bank('middleages', templates, TOPICS.length * 20);

// Learning Heat Capacity: the path (using Q = mcΔT, then turning it around, then heat moving between things) and a
// short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong answer.
export const heatLearning = {
  path: [
    { unit: 'Using Q = mcΔT', topics: [
      'Heat needed to warm something', 'Heat in kilojoules', 'Heat released while cooling', 'Calories'
    ] },
    { unit: 'Turning it around', topics: [
      'Finding the mass', 'Finding the specific heat', 'Final temperature', 'Same heat, different materials'
    ] },
    { unit: 'Heat on the move', topics: [
      'Electric heater', 'Mixing: final temperature', 'Mixing: unknown metal'
    ] },
  ],
  lessons: {
    'Heat needed to warm something': {
      idea: 'The heat Q needed to warm something depends on three things: how much of it there is (the mass m), what it is made of (the specific heat c), and how many degrees it warms (ΔT). <b>Q = mcΔT</b> multiplies them. The specific heat is the heat needed to warm 1 g by 1 °C, so warming 10 g of a material with c = 2 J/(g·°C) by 5 °C takes 10 × 2 × 5 = 100 J.',
      how: ['Find the temperature change: ΔT = final temperature − starting temperature.', 'Multiply Q = m × c × ΔT, with m in grams and c in J/(g·°C).', 'The answer comes out in joules (J).'],
      watch: ['Using the final temperature instead of ΔT: you need the change, not the temperature itself.', 'Adding the three numbers instead of multiplying them.'],
      tip: 'Find the temperature change first, then multiply mass × specific heat × that change.',
    },
    'Heat in kilojoules': {
      idea: 'This is the same Q = mcΔT, with bigger units: the mass in kilograms and c in J/(kg·°C). In those units c is 1000 times bigger than in J/(g·°C), because a kilogram is 1000 grams, so the answer still comes out in joules. Large numbers of joules are easier to read as kilojoules: 1 kJ = 1000 J. For example, 2 kg × 500 J/(kg·°C) × 3 °C = 3000 J = 3 kJ.',
      how: ['Keep the mass in kg, since c is given in J/(kg·°C).', 'Multiply Q = m × c × ΔT to get joules.', 'Divide by 1000 to turn the joules into kilojoules.'],
      watch: ['Changing the mass to grams as well: with c in J/(kg·°C) that makes the answer 1000 times too big.', 'Stopping at joules: the question asks for kJ.'],
      tip: 'The units already match (kg with J/(kg·°C)): multiply, then divide the joules by 1000.',
    },
    'Heat released while cooling': {
      idea: 'When something cools, ΔT = final − initial is negative, so Q = mcΔT comes out negative. The minus sign just says the heat leaves the object instead of going in. The amount given off is the same as the heat it would take to warm it back up, so you can use the size of the temperature drop. Cooling 10 g with c = 2 J/(g·°C) by 5 °C gives off 10 × 2 × 5 = 100 J.',
      how: ['Find how many degrees it cooled: starting temperature − final temperature.', 'Multiply mass × specific heat × that drop.', 'Give the answer as a positive number of joules, since the question asks how much is given off.'],
      watch: ['Using one of the temperatures instead of the change between them.', 'Leaving a minus sign on the answer when the question asks for a positive amount.'],
      tip: 'Heat given off = mass × specific heat × how many degrees it cooled.',
    },
    'Calories': {
      idea: 'A calorie is another unit of heat: the heat that warms 1 g of water by 1 °C. So water\'s specific heat is exactly 1 cal/(g·°C), and the heat in calories is just grams × degrees. One calorie is 4.184 J, so to turn calories into joules, multiply by 4.184. Warming 10 g of water by 3 °C takes 30 cal, which is 30 × 4.184 = 125.52 J.',
      how: ['Find the heat in calories: Q = m × 1 cal/(g·°C) × ΔT.', 'If the question wants joules, multiply the calories by 4.184.', 'Check which unit the question asks for before you answer.'],
      watch: ['Dividing by 4.184 instead of multiplying: a joule is smaller than a calorie, so there are more joules.', 'Using c = 4.18 J/(g·°C) and then multiplying by 4.184 again: convert only once.'],
      tip: 'For water, calories = grams × degrees; joules are 4.184 times as many.',
    },
    'Finding the mass': {
      idea: 'Q = mcΔT works backwards too. If you know the heat, the specific heat and the temperature change, the mass is the only unknown, so divide the heat by the other two: <b>m = Q/(cΔT)</b>. If 60 J warms a material with c = 2 J/(g·°C) by 3 °C, its mass is 60 ÷ (2 × 3) = 10 g.',
      how: ['Write Q = mcΔT and notice that m is the unknown.', 'Multiply c × ΔT.', 'Divide Q by that product: m = Q/(cΔT), in grams.'],
      watch: ['Dividing by c but multiplying by ΔT: divide by both.', 'Multiplying Q by c × ΔT instead of dividing.'],
      tip: 'Rearrange Q = mcΔT for m: divide the heat by (specific heat × temperature change).',
    },
    'Finding the specific heat': {
      idea: 'The specific heat c tells you how hard a material is to warm: <b>c = Q/(mΔT)</b> is the heat per gram per degree. Each substance has its own value (water 4.18, aluminum 0.9, copper 0.385 J/(g·°C)), so measuring c can tell you what something is made of. If 90 J warms 10 g by 10 °C, c = 90 ÷ (10 × 10) = 0.9 J/(g·°C), which matches aluminum.',
      how: ['Multiply the mass by the temperature change.', 'Divide the heat by that product: c = Q/(mΔT).', 'Find the closest value in the table to name the material.'],
      watch: ['Dividing the wrong way round (mΔT/Q) gives a number that is upside down.', 'Rounding too early: keep a few decimal places so you pick the right material.'],
      tip: 'Specific heat is heat per gram per degree: divide the heat by (mass × temperature change).',
    },
    'Final temperature': {
      idea: 'Adding heat raises the temperature by <b>ΔT = Q/(mc)</b>, and the final temperature is the starting temperature plus that rise. A material with a small specific heat, like a metal, warms a lot from a little heat; water, with its large c, warms much less. For example, 200 J added to 10 g with c = 4 J/(g·°C) gives ΔT = 200 ÷ (10 × 4) = 5 °C, so 20 °C becomes 25 °C.',
      how: ['Find the rise: ΔT = Q/(m × c).', 'Add the rise to the starting temperature.', 'Give the answer in °C.'],
      watch: ['Giving the rise as the answer: add it to the starting temperature.', 'Dividing Q by only m or only c: divide by their product.'],
      tip: 'Work out how many degrees the heat raises it, then add that to where it started.',
    },
    'Same heat, different materials': {
      idea: 'If equal masses take in the same heat, then m × c × ΔT is the same for both, and since m is the same, <b>c × ΔT</b> is the same. So a material with half the specific heat warms twice as much. In numbers: ΔT of the second = ΔT of the first × c of the first ÷ c of the second. If water (4.18) warms by 2 °C, the same heat in the same mass of aluminum (0.9) warms it by 2 × 4.18 ÷ 0.9 ≈ 9.29 °C.',
      how: ['Notice that Q and m are the same for both, so c × ΔT is the same.', 'Multiply the known temperature change by its material\'s specific heat.', 'Divide by the other material\'s specific heat.'],
      watch: ['Turning the ratio upside down: a lower specific heat means a bigger temperature change.', 'Assuming both warm by the same number of degrees.'],
      tip: 'Same heat and same mass means specific heat × temperature change is equal for the two materials.',
    },
    'Electric heater': {
      idea: 'A heater\'s power in watts is how many joules it gives out every second: 1 W = 1 J/s. So the energy it delivers is <b>Q = P × t</b>, with t in seconds. If all that energy goes into the water, the rise is ΔT = Q/(mc) with c = 4.18 J/(g·°C). A 100 W heater running for 60 s gives 6000 J; in 1000 g of water that is 6000 ÷ (1000 × 4.18) ≈ 1.44 °C.',
      how: ['Change the time to seconds (minutes × 60).', 'Energy from the heater: Q = P × t, in joules.', 'Temperature rise of the water: ΔT = Q/(m × 4.18).'],
      watch: ['Using minutes instead of seconds: a watt is a joule per second.', 'Giving the energy in joules when the question asks for the temperature rise.'],
      tip: 'Find the joules first (watts × seconds), then see how many degrees that warms the water.',
    },
    'Mixing: final temperature': {
      idea: 'When hot metal goes into cool water, heat flows from the hot one to the cold one until both reach the same final temperature T. If no heat escapes, the heat the metal loses equals the heat the water gains: m<sub>1</sub>c<sub>1</sub>(T<sub>1</sub> − T) = m<sub>2</sub>c<sub>2</sub>(T − T<sub>2</sub>). Solving gives a weighted average of the two temperatures, so T always lands between them, and close to the water\'s, because water\'s mass × specific heat is so much larger.',
      how: ['Write the heat lost by the metal: m<sub>1</sub>c<sub>1</sub>(T<sub>1</sub> − T).', 'Write the heat gained by the water: m<sub>2</sub>c<sub>2</sub>(T − T<sub>2</sub>).', 'Set them equal and solve for T: T = (m<sub>1</sub>c<sub>1</sub>T<sub>1</sub> + m<sub>2</sub>c<sub>2</sub>T<sub>2</sub>) / (m<sub>1</sub>c<sub>1</sub> + m<sub>2</sub>c<sub>2</sub>).', 'Check that T is between the two starting temperatures.'],
      watch: ['Simply averaging the two temperatures: the water\'s much larger mass × specific heat pulls T toward its own temperature.', 'A final temperature outside the two starting ones means a sign is wrong.'],
      tip: 'Set the heat lost by the metal equal to the heat gained by the water, with the same final temperature T in both.',
    },
    'Mixing: unknown metal': {
      idea: 'The same balance can find a specific heat. You are told the final temperature, so you can work out exactly how much heat the water gained: its mass × 4.18 × its temperature rise. The metal lost that same heat while cooling from its starting temperature down to the final one, so its specific heat is that heat ÷ (the metal\'s mass × its temperature drop). Comparing the result with the table hints at which metal it is.',
      how: ['Heat gained by the water: mass of water × 4.18 × (final temperature − water\'s starting temperature).', 'Temperature drop of the metal: its starting temperature − final temperature.', 'Specific heat of the metal: c = heat gained by the water ÷ (mass of metal × its drop).'],
      watch: ['Using the water\'s temperature change for the metal: each one changes by a different amount.', 'Using the water\'s mass in the metal\'s part of the calculation.'],
      tip: 'Find the heat the water gained first; the metal lost exactly that much.',
    },
  },
};

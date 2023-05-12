let tests = [
  {question: [[0,0], [2,2]], answer: [[0,0], [1,1]], result: "ok"},
  {question: [[0,0], [4,4]], answer: [[0,0], [1,1], [2,2], [3,3]], result: "ok"},
  {question: [[1,4], [4,1]], answer: [[1,3], [2,2], [3,1]], result: "ok"},
  {question: [[1.5,4.5], [4.5,1.5]], answer: [[1,4], [2,3], [3,2], [4,1]], result: "ok"},
  {question: [[1,3], [5,6]], answer: [[1,3], [2,3], [2,4], [3,4], [3,5], [4,5]], result: "ok"},
  {question: [[2,6], [4,3]], answer: [[2,5], [2,4], [3,4], [3,3]], result: "ok"},
  {question: [[3,5], [6,3]], answer: [[3,4], [4,4], [4,3], [5,3]], result: "ok"},
  {question: [[3,8], [6,5]], answer: [[3,7], [4,6], [5,5]], result: "ok"},
  {question: [[10,3], [12,1]], answer: [[10,2], [11,1]], result: "ok"},
  {question: [[12,1], [10,3]], answer: [[10,2], [11,1]], result: "ok"},
  {question: [[10,3], [12.5,0.5]], answer: [[10,2], [11,1], [12,0]], result: "ok"},
  {question: [[12.5,0.5], [10,3]], answer: [[10,2], [11,1], [12,0]], result: "ok"},
  {question: [[9.5,3.5], [12,1]], answer: [[9,3], [10,2], [11,1]], result: "ok"},
  {question: [[12,1], [9.5,3.5]], answer: [[9,3], [10,2], [11,1]], result: "ok"},
  {question: [[2.5,2.2], [4.8,4.2]], answer: [[2,2], [3,2], [3,3], [4,3], [4,4]], result: "ok"},
  {question: [[1,8], [4.5,6.5]], answer: [[1,7], [2,7], [3,7], [3,6], [4,6]], result: "ok"},
]


function compareCoords(coords1, coords2){
  
  function equal(A, B) {
    return A.every((x, i) => x === B[i]);
  }

  if(coords1.length != coords2.length) return false;
  let fwd = true;
  for(let i = 0; i < coords1.length; ++i){
    if(!equal(coords1[i], coords2[i])) fwd = false;
  }
  coords2.reverse();
  let rev = true;
  for(let i = 0; i < coords1.length; ++i){
    if(!equal(coords1[i], coords2[i])){
      if(fwd == false) console.log(coords1[i], coords2[i]);
      rev = false;
    }
  }
  if(fwd == false && rev == false) console.log(coords1, coords2);
  return fwd || rev;
}

for(const test of tests){
  console.assert(compareCoords(test.answer, CustomLOSGenerator(...test.question)), `test failed:
  question:        ${coords2String(test.question)}
  given answer:    ${coords2String(test.answer)}
  computed answer: ${coords2String(CustomLOSGenerator(...test.question))}
  `);
}
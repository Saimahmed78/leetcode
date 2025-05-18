// const obj = { {a: "1", b: "2"}, c: 3 };

// const obj2=Object.entries(obj)
// const [a,b,c]= obj2
// console.log("output of obj2 is ",a,b,c)

// const submissionResult = [{ token: 12 }, { token: 124 }, { token: 345 }];
// const tokens = submissionResult.map(() => {
// //   console.log("res", res);
//   return token;
// });

// console.log(tokens);

const obj ={ 
  name:"Saim Ahmed",
  class:"BSSE",
  tag:"erf"
}
const stringify=JSON.stringify(obj)
console.log(stringify)
const obj1=JSON.parse(stringify)
console.log(obj1)
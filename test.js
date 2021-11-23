let a = [1, 2, 5, 4] 
const idx = a.indexOf(a[2]) 
if (idx > -1) a.splice(idx, 1)
console.log(a)
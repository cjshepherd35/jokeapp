// const { spawn } = require('child_process')
// let arp = [1, 3, 2]
// // const childPython = spawn('python', ['--version'])
// const childPython = spawn('python', ['server/server.py', arp])


// childPython.stdout.on('data', (data) => {
    
//     console.log(`array: ${data}`)
// })

// childPython.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`)
// })

// childPython.on('close', (code) => {
//     console.log(`exited with code ${code}`)
// })
jz = require("jeezy")
data = []
// let cols = "abc".split("")
// for(let i=0; i<3; i++){
//     let obj = {index: i}
//     cols.forEach(col =>{
//         obj[col] = Math.random()
//     })
//     data.push(obj)
// }

const seenjokefactory = (jokeid, rating) => {
    return{
        jokeidnum: jokeid, 
        rating: rating
    }
}

const jokefactory = (id, jokestring) => {
    return {
        jokeidnum: id, 
        jokestring: jokestring
    }
}


jokelist = 
[
    jokefactory(0,  "this is funny joke"),
    {
        jokeidnum: 1, 
        jokestring: "this is dark  joke"
    },
    {
        jokeidnum: 2, 
        jokestring: "this is bad  joke."
    }, 
    jokefactory(3, " this is dad joke.")
]

let cols  = []
jokelist.forEach(joke => {
    cols.push(joke.jokeidnum.toString())
});

let clientlist = [{
    user: "mark",
    jokes: [seenjokefactory(0,4),  seenjokefactory(3,5)]
    // jokes: []
}, 
{
    user: "caleb",
    jokes: [seenjokefactory(0,5), seenjokefactory(3,4), seenjokefactory(2,4), seenjokefactory(1,5)]
},
{
    user: "colton",
    jokes: [seenjokefactory(0,4), seenjokefactory(1,5), seenjokefactory(3,2), seenjokefactory(2,5)]
}
// ,{
//     // user: "nathan",
//     // jokes: [seenjokefactory(0,3), seenjokefactory(2,2)]
// }
]


clientlist.forEach(client =>{
    obj = {user: client.user}
    client.jokes.forEach(clientjoke => {
        obj[clientjoke.jokeidnum] = clientjoke.rating
    })
    data.push(obj)
})
let needcols = []
let sum = []
cols.forEach(col =>{
    sum[col] = 0
})
for(let i=0; i< clientlist.length; i++)
{
    cols.forEach(col => {
        if(!data[i][col]){
            
            
            needcols.push(col)
        } else {

            sum[col] += data[i][col]
            
        }
    })
}
console.log('data b4')
console.log(data)
let avg = new Array(sum.length)
    for(let j=0; j<sum.length;j++){
        avg[j] = sum[j]/clientlist.length
    }
// for(let i=0; i<clientlist.length; i++){
//     cols.forEach(col =>{
//         if(!data[i][col])
//         needcols.forEach(neededcol  =>{
//             data[i][neededcol.toString()] = avg[neededcol]
//     })
//     }) 
// }
for(let i=0; i<clientlist.length; i++){
    cols.forEach(col => {
        if(!data[i][col]){
            data[i][col] = avg[col]
            
        }
    });
}
console.log(avg)
console.log(data)

corr = jz.arr.correlationMatrix(data, cols)
// console.log(corr)
zerocorr = []
corr.forEach(cor => {
    if(cor.column_x === '0'){
        zerocorr.push(cor)
    }
})
console.log(zerocorr)
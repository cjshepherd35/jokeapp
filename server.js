const { rejects } = require("assert")
const { watch } = require("fs")
const { resolve } = require("path")
const WebSocket = require("ws")
var jz = require("jeezy")
const request = require("request")
const wss = new WebSocket.Server( { port: 8082})
const jokecard = require('./jokelist')
let oldjoke
//create class for user client objects. needs...
//username, list of jokes seen, which will be an object of jokeid and rating.
const seenjokefactory = (jokeid, rating) => {
    return{
        jokeid: jokeid, 
        rating: rating
    }
}
const clientobjectfactory = (username) => {
    return {
        username: username,
        jokes: []
    }
}
const jokefactory = (id, jokestring) => {
    return {
        jokeidnum: id, 
        jokestring: jokestring
    }
}



/*let clientlist = [{
    user: "mark",
    jokes: []
}, 
{
    user: "caleb",
    jokes: [seenjokefactory(0,5), seenjokefactory(3,4), seenjokefactory(2,4)]
},
{
    user: "colton",
    jokes: [seenjokefactory(0,4), seenjokefactory(1,5), seenjokefactory(3,2)]
},{
    user: "nathan",
    jokes: [seenjokefactory(0,3), seenjokefactory(2,2), seenjokefactory(3,4)]
},
{
    user: "jared",
    jokes: [seenjokefactory(0,3), seenjokefactory(1,2), seenjokefactory(3,4)]
}, 
{
    user: "unknown",
    jokes: [seenjokefactory(0,4), seenjokefactory(1,3), seenjokefactory(2,5), seenjokefactory(3,4)]
},
{
    user: "partner",
    jokes: [seenjokefactory(0,5), seenjokefactory(1,2), seenjokefactory(3,5)]
},
{
    user: "paul",
    jokes: []
}
]*/
//gets jokes from api ninja
jokelist = jokecard.createJokeList()

//creates correlations between jokes
const generatecorrjokes = () => {
    jz = require("jeezy")
    data = []
    let cols  = []
    jokelist.forEach(joke => {
        cols.push(joke.jokeidnum.toString())
    })
    clientlist.forEach(client =>{
        obj = {user: client.user}
        client.jokes.forEach(clientjoke => {
            obj[clientjoke.jokeid] = clientjoke.rating
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
    
    let avg = new Array(sum.length)
    for(let j=0; j<sum.length;j++){
        avg[j] = sum[j]/clientlist.length
    }

    for(let i=0; i<clientlist.length; i++){
        cols.forEach(col =>{
            if(!data[i][col]){
                data[i][col] = avg[Number(col)]
            }
        }) 
    }
    
    corrmat = jz.arr.correlationMatrix(data, cols)
    corrtocurrent = []
    if(oldjoke) {
        corrmat.forEach(cor => {
            if(cor.column_x === oldjoke.toString() && cor.column_y !== oldjoke.toString()){
                corrtocurrent.push(cor)
            }
        })
    }
    console.log('cor to current ')
    console.log(corrtocurrent)
    return corrtocurrent
}

const usedcorrelatedjokes = (currclient, bestcorr, rabbithole = 0) => {
    let correlatedjoke = bestcorr[Math.floor(Math.random()*bestcorr.length)]
    
    currclient.jokes.forEach(joke =>{
        try{
            if(joke.jokeid === correlatedjoke.jokeidnum){
                if(rabbithole > 4){
                    throw false
                }
    
                currentjoke = usedcorrelatedjokes(currclient, bestcorr, rabbithole++)
                throw false
            }
        } catch(e) {
            console.log('joke trying didnt work')
        }
    })
}

//checks if joke was already seen by person, keeps trying jokes until new one found
const usedjoke = (currclient) => {
    
    let currentjoke = jokelist[Math.floor(Math.random()*jokelist.length)]
    

    currclient.jokes.forEach(joke =>{
        try{
            if(joke.jokeid === currentjoke.jokeidnum){
    
                currentjoke = usedjoke(currclient)
                throw false
            }
        } catch(e) {
            console.log('joke trying didnt work')
        }
    })
//////////
    let corrtocurrent
    let currentjokerating
    let bestcorr = []
    if(currclient.jokes.length > 0){
        corrtocurrent = generatecorrjokes()
        if(corrtocurrent){
            currclient.jokes.forEach(joke =>{
                if(joke.jokeidnum === oldjoke){
                    currentjokerating = joke.rating
                }
            })
            if(currentjokerating > 2) {
    
                corrtocurrent.forEach(cor => {
                    if(cor.correlation > 0.2){
                            bestcorr.push(cor)
                        }
                })
                
            }else {
                corrtocurrent.forEach(cor => {
                    if(cor.correlation < 0){
                            bestcorr.push(cor)
                        }
                })
            }
            let correlatedjoke = usedcorrelatedjokes(currclient, bestcorr)
            console.log('corr joke is ')
            console.log(correlatedjoke)
            try{
                jokelist.forEach(joke => {
                    
                    if(correlatedjoke.column_y === joke.jokeidnum.toString()){
                        currentjoke = joke
                    }
                    
                })
            } catch(e) {
                console.log('corredjoke didnt work')
            }
        }
        
        
    }
    return currentjoke
}


const checkjoke =  (clientlist, currclient) => {
    let currentjoke
    currentjoke = usedjoke(currclient)
    clientjokes = []

    clientlist.forEach(client => {
        clientjokes.push(client.jokes)
    })
    return currentjoke
}

//send joke to client.
const sendjokes = (alreadyuser, theclient, currclient, ws, clientlist) => {
    let currentjoke = checkjoke(clientlist, currclient)
    console.log('sending joke')
    console.log(currentjoke)
    const onserverisuser = {
        user: currclient.user,
        alreadyuser: alreadyuser, 
        newuserpage: theclient.isnewuser, 
        currentjoke: currentjoke,
        isgettinguser: theclient.isgettinguser
    }
    ws.send(JSON.stringify(onserverisuser))
    const clientjoke = { jokeid: theclient.jokeid, rating: theclient.rating}
    
    
    if(!(theclient.isgettinguser) && (oldjoke !== currentjoke.jokeidnum) ){
        currclient.jokes.push(clientjoke)
        console.log('client after insertion')
        console.log(currclient)
    }
    oldjoke = currentjoke.jokeidnum
    
}


//function to check if user is on file. for user login
//currclient is current client from clientlist, has "jokes" list and 'user' name
const checkuser = (theclient, ws) => {
    let alreadyuser = false
    try{
        clientlist.forEach(client => {
            if(client.user === theclient.user)
            {
                currclient = client
                throw true
            }
        })
    }
    catch (e) {
        alreadyuser = e
    }
   
    sendjokes(alreadyuser, theclient, currclient, ws, clientlist)
    return currclient
}

wss.on("connection", ws => {
    console.log('new client on')
    let alreadyuser = false
    jokelist = jokelist
    console.log(jokelist)
    let currclient
    ws.on("message", data => {
        theclient = JSON.parse(data)
        let user = theclient.user
        //new user page reciever. 
        if(theclient.isnewuser)
        { 
            try{ clientlist.forEach(client => {
                
                if(user === client.user) {
                    throw true
                } 
            } )}
            catch (e) {
                alreadyuser = e
            }
            if(!alreadyuser) {
                currclient = clientobjectfactory(user)
                clientlist.push(currclient)
            }
            //...send jokes function starts here.....
            const onserverisuser = {
                user: user, 
                alreadyuser: alreadyuser,
                newuserpage: theclient.isnewuser, 
                currentjoke: jokelist[0]
            }
            ws.send(JSON.stringify( onserverisuser ))
            //..........send jokes function ends here..... 
            
            alreadyuser = false

            // login page part..... not new user.
        } else if(!theclient.isnewuser)
        {
            if(theclient.isgettinguser){
                currclient = checkuser(theclient, ws)
            } else if(!theclient.isgettinguser){
                alreadyuser = true
                sendjokes(alreadyuser, theclient, currclient, ws, clientlist)
            }
        } 
    })
    
})



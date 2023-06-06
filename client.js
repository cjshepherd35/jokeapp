const ws = new WebSocket('ws://localhost:9229')




const newuserfunc = (e, currentjoke, ratingobj, joketext) => {
    let usercontainer = JSON.parse(e.data)
    console.log(usercontainer)
    let answer = usercontainer.alreadyuser
    
    if (answer === true) {
        alert("username already taken, try again.")
        return
    } else {
        joketext = jokepage(currentjoke, ratingobj, joketext)
        newusercreationform.classList.add('hidden')
    }
    return joketext
}


const jokepage  = (currentjoke, ratingobj, joketext) => {
    joketext = document.createTextNode(currentjoke.jokestring)
    const jokediv = document.createElement('div')
    const ratinginput = document.createElement('input')
    const ratingbutton = document.createElement('button')
    const ratingdiv = document.createElement('div')
    ratinginput.placeholder = 'rate joke 1-5'
    ratingbutton.innerHTML = 'send rating'

    jokediv.appendChild(joketext)
    ratingdiv.appendChild(ratinginput)
    ratingdiv.appendChild(ratingbutton)
    jokeform.appendChild(jokediv)
    jokeform.appendChild(ratingdiv)
    ratingobj.jokeid = currentjoke.jokeidnum   
    
    ratingobj.isgettinguser = false
    jokeform.addEventListener('submit', (e) => {
        e.preventDefault()
        // joketext.textContent = currentjoke.jokestring
        ratingobj.rating = Number(ratinginput.value)
        ws.send(JSON.stringify( ratingobj))
        ratinginput.value = ''
    })
    return joketext
}


const loginload = () => {
    const loginform = document.querySelector("#user-login")
    const newuserform = document.querySelector('#newuserform')
    const input = document.querySelector("#username")
    const jokeform = document.querySelector("#jokeform")
    const newusercreationform = document.querySelector('#newusercreationform')
    let isnewuser = false
    let joketext
    
    let currentjoke
    const ratingobj = {
        user: null,
        jokeid: null, 
        jokestring: null,
        rating: null,
        isnewuser: null,
        isgettinguser:  false
    }
    //lets user log in. 
    loginform.addEventListener('submit', e => {
        e.preventDefault()
        ratingobj.isnewuser = false
        ratingobj.isgettinguser = true
        ratingobj.user = input.value
        if(!ratingobj.user)
        {
            alert("please enter a user name")
            return
        }
        ws.send(JSON.stringify(ratingobj))
        
    })
    
    //lets new user get to account creation page
    newuserform.addEventListener('submit', e => {
        e.preventDefault()
        const newuserinput = document.createElement('input')
        const newusersend = document.createElement('button')
        newuserinput.placeholder = 'username'
        newusersend.innerHTML = 'create'
        newusercreationform.appendChild(newuserinput)
        newusercreationform.appendChild(newusersend)
    
        newuserform.classList.add('hidden')
        loginform.classList.add('hidden')
    
        newusercreationform.addEventListener('submit', e => {
            e.preventDefault()
            ratingobj.isnewuser = true
            if(!newuserinput.value) {
                alert("please enter a user name")
                return
            }
            
            ratingobj.user = newuserinput.value
            ws.send(JSON.stringify(ratingobj))
            
        })
        
    })
    ws.addEventListener('message', e => {
        let usercontaner = JSON.parse(e.data)
        let isactiveuser = usercontaner.alreadyuser
        currentjoke = usercontaner.currentjoke
        // console.log('is active: ' + isactiveuser)
        ratingobj.isgettinguser = usercontaner.isgettinguser
        //current users
        console.log('got message')
        if(!usercontaner.newuserpage)
        {
            if(!isactiveuser) {
                alert('not a current user')
            } else  if(isactiveuser){
                if(ratingobj.isgettinguser){
                    joketext = jokepage(currentjoke, ratingobj, joketext)
                    newuserform.classList.add('hidden')
                    loginform.classList.add('hidden')
                }
                else if(!ratingobj.isgettinguser){
                    ratingobj.jokeid = usercontaner.currentjoke.jokeidnum
                    ratingobj.jokestring = usercontaner.currentjoke.jokestring
                    joketext.textContent = currentjoke.jokestring
                    
                }
                
            }
        } else if(usercontaner.newuserpage)
        {
            joketext = newuserfunc(e, currentjoke, ratingobj)
            ratingobj.isnewuser = false
        }
        
    })
}



window.addEventListener('load', loginload())



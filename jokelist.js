const request = require('request');

function getjokes(limit) 
    {
        return new Promise((resolve, reject) => {

            request.get({
                url: 'https://api.api-ninjas.com/v1/jokes?limit=' + limit,
                headers: {
                'X-Api-Key': 'huGRRZsAzU/dqIVPu9OQFA==aMaYrQs0c0Y4oOXM'
                },
            }, function(error, response, body) {
                if(error) return console.error('Request failed:', error);
                else if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
                else {
                    resolve(body)
                    return body
                }
            }); 
        })
    }

    async function createJokeList() {

        
        var limit = 6
        jokelist = await getjokes(limit)
        jokelist = JSON.parse(jokelist)
        
        jokelist.forEach((joke,index) => {
            joke.jokeidnum = index
            joke.jokestring = joke.joke
        })
        console.log(jokelist)
        console.log('after')
        return jokelist
    }
    
    module.exports = {createJokeList}
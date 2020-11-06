var express = require('express');
var router = express.Router();
const https = require('https');

// Search youtube with a specific term
router.get('/', async function(req, res, next) {
    let term = req.query.term;
    let pageToken = req.query.pageToken;

    let url = "https://youtube.googleapis.com/youtube/v3/search?q=" + term +
    "&key=AIzaSyC_z5jw7UtqAva3gYDpiyFjNReBXDds3mE&part=snippet&maxResults=5";

    if(pageToken){
        url += "&pageToken=" + pageToken
    }
    
    https.get(url, youtubeRes => {
        let data = "";

        youtubeRes.on("data", chunk => {
            data += chunk;
        });

        youtubeRes.on("end", () => {
            let parsedData = JSON.parse(data);

            // Extract the token for the next page of songs
            let nextPageToken = parsedData.nextPageToken;
            let prevPageToken = parsedData.prevPageToken;

            let songs = [];

            // Extract video id
            parsedData.items.forEach(item => {
                let song = {};
                song.youtubeId = item.id.videoId;
                song.name = item.snippet.title;
                songs.push(song);
            });

            let responseObject = {
                prevPageToken: prevPageToken,
                nextPageToken: nextPageToken,
                songs: songs
            }

            res.header("Access-Control-Allow-Origin", "*");
            res.json(responseObject);
        });
    })
});

module.exports = router;
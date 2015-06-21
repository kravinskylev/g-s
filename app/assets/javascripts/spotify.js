$(document).ready(function() {
    var templateSource = document.getElementById('results-template').innerHTML,
        template = Handlebars.compile(templateSource),
        resultsPlaceholder = document.getElementById('results'),
        playingCssClass = 'playing',
        audioObject = null;

    var fetchTracks = function(albumId, callback) {
        $.ajax({
            url: 'https://api.spotify.com/v1/albums/' + albumId,
            success: function(response) {
                callback(response);
            }
        });
    };

    var searchAlbums = function(query) {
        return $.ajax({
            url: 'https://api.spotify.com/v1/search',
            data: {
                q: query,
                type: 'album'
            },
            success: function(response) {
                resultsPlaceholder.innerHTML = template(response);
            }
        });
    };

    results.addEventListener('click', function(e) {
        var target = e.target;
        if (target !== null && target.classList.contains('cover')) {
            if (target.classList.contains(playingCssClass)) {
                audioObject.pause();
            } else {
                if (audioObject) {
                    audioObject.pause();
                }
                fetchTracks(target.getAttribute('data-album-id'), function(data) {
                    audioObject = new Audio(data.tracks.items[0].preview_url);
                    audioTrack = data.tracks.items[0].name;
                    audioObject.play();
                    target.classList.add(playingCssClass);
                    audioObject.addEventListener('ended', function() {
                        target.classList.remove(playingCssClass);
                    });
                    audioObject.addEventListener('pause', function() {
                        target.classList.remove(playingCssClass);
                    });
                });
            }
        }
    });


    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        searchAlbums(document.getElementById('query').value)
            .then(function(success) {
                document.getElementById('results').addEventListener('click', function() {
                    var accessToken = 'PcqCGSGsDgsPl57ftML4D2Rpq9SQgp4wgQEAdQw4UT7M69RTWJQi3dz_9eU1pr5F';
                    var query = (document.getElementById('query').value);
                    fetch('https://api.genius.com/search?access_token=' + accessToken + '&q=' + encodeURIComponent(query)).then(function(response) {
                        response.json().then(function(data) {
                            //turning "Empire State Of Mind" into "empire-state-of-mind"
                            splitted = (audioTrack.split(" ").join("-"));
                            splitLower = splitted.toLowerCase();
                            geniusUrl = data.response.hits.filter(function(hit) {
                                return hit.result.url.includes(splitLower);
                            });
                            //Getting Song ID from Genius API
                            songId = (geniusUrl[0].result.id);
                            //Creating the div and script tags I need to inject into the DOM
                            embedDiv = "<div id='rg_embed_link_" + songId + "' class='rg_embed_link'></div> ";
                            embedScript = "<script crossorigin src='//genius.com/songs/" + songId + "/embed.js'></script>";
                            embedGenius = embedDiv + embedScript;
                            //This is what breaks it: embedGenius is calling an external js file that uses document.write
                            $(".embed").append(embedGenius);

                            //Other miscellaneous attempts at fixing this:
                            //$('body').append(embedDiv)
                            //console.log(embedGenius);

                            //attempting to circumvent CORS restrictions
                            //var foo = function(src) {
                            //var script = document.createElement('script');
                            //script.type = "text/javascript";
                            //script.src = src;
                            //script.async = false;
                            //document.getElementsByTagName('head')[0].appendChild(script);
                            //};
                            //foo('//genius.com/songs/177832/embed.js')
                            //console.log(eval(embedGenius));
                            //console.log($(".embed").innerHTML);
                        });
                    });
                });
            });
    }, false);
});


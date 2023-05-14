// $(function () {

    //const list1 = ['audio/1.m4a', 'audio/2.m4a', 'audio/3.m4a', 'audio/4.m4a'];
    var list1, list2, listLength, playingList, sound1, sound2, currentTime, pausedState;
    var i = 0;
    var k = 1;
    var playPauseState = 0;
    $("input[name=place]").val("test-test-test-serverless-start-demo");
    //place = "So-Wok";
    //var ta = document.getElementById('place');
    //ta.value = place;

    //var for like/dislike func
    var $formLike = $('form#formLike');
    var $formDislike = $('form#formDislike');
    // -----======================================================CAHNGE HERE script URL=========================================----
    //yula url
    //sowok url new
    url = 'https://script.google.com/macros/s/AKfycbzo-dseztbEUx2zf9HJn24Iz4kBkRZIfUpb3dTHv2Syg1DxpxCQ1x3BzniIkwOjVPkGyg/exec';


    console.log({oh: url})
    //(<any>this.sound)._src = newSrc;

    //РІСЂРµРјСЏ РЅР°С‡Р°Р»Р° РїСЂРѕРёРіСЂС‹РІР°РЅРёСЏ РІС‚РѕСЂРѕРіРѕ Р»РёСЃС‚Р°
    //const hourForPlayingList2 = 18;

    //fade time in sec
    const fadeTime = 2.0;

// -----======================================================CAHNGE HERE restaurant path=========================================----
    $.ajax({
        url: "https://570427.selcdn.ru/Sphere/playSalut/tracksDay.txt",
        contentType: "text/plain; charset=utf-8",
        success: function (data) {
            //parsing tracks.txt
            list1 = data.split(/\r\n|\r|\n/g);

            // because i here rewrites i below
            for (var index = 0; index < list1.length; index++) {
                list1[index] = "https://570427.selcdn.ru/Sphere/musiclibrary/" + list1[index];
            }

            //list1 = tracksArray;
            playingList = list1;
            listLength = playingList.length;
            console.log({list1});

            // console.log("playing list is" + playingList);

            // shuffling 2 arrays
            shuffle(list1);
            // console.log("shuffled list1" + list1);


            $("#howler-play").show();


            console.log('ajax: successfully loaded')

            // $("#howler-play").on("click", function () {


            if (playPauseState == 0) {

                loadingSound1(i, playingList);
                loadingSound2(k, playingList);
                // sound1.play();
                console.log({sound1})
                console.log("initialiation complete");

                playPauseState = "playing";
            }

            {
            //
            // } else if (playPauseState == "playing") {
            //
            //     if (sound1.playing() && !sound2.playing()) {
            //         sound1.pause();
            //         pausedState = 1;
            //         console.log(pausedState);
            //     } else if (!sound1.playing() && sound2.playing()) {
            //         sound2.pause();
            //         pausedState = 2;
            //         console.log(pausedState);
            //     } else if (sound1.playing() && sound2.playing()) {
            //         sound1.pause();
            //         sound2.pause();
            //         pausedState = 3;
            //         console.log(pausedState);
            //     } else {
            //
            //     }
            //
            //     playPauseState = "paused";
            //     console.log("paused complete");
            //
            // } else {
            //
            //     if (pausedState == 1) {
            //         sound1.play();
            //     } else if (pausedState == 2) {
            //         sound2.play();
            //     } else if (pausedState == 3) {
            //         sound1.play();
            //         sound2.play();
            //     }
            //
            //     playPauseState = "playing";
            //     console.log("playing complete");
            //
            // }
            // // });
            }
        },
        error: function () {
            // failed to load tracks.txt
            console.log("failed to load tracks1.txt");
        }
    });


    //var listLength = playingList.length;


    // function for shuffling array
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    const preloading = {
    //---------------------------------- BLOCK for preloading
    /*
    var loaded = 0;
    function loadedAudio() {
        // this will be called every time an audio file is loaded
        // we keep track of the loaded files vs the requested files
        loaded++;
        console.log(loaded + " audio files loaded!");
        if (loaded == list2.length){
          console.log("ALL files have loaded");
         // main();
        }
    }

    function preloadsounds()
    {
      //$("#loader").show();
      //console.log(level.config);
      //audioFiles = level.config.soundfiles;

      // we start preloading all the audio files with html audio
      for (var i in list2) {
          preloadAudio(list2[i]);
      }
    }

    function preloadAudio(url)
    {
      console.log("trying to preload "+ url);
      var audio = new Audio();
      // once this file loads, it will call loadedAudio()
      // the file will be kept by the browser as cache
      audio.addEventListener('canplaythrough', loadedAudio, false);

      audio.addEventListener('error', function failed(e)
      {
        console.log("COULD NOT LOAD AUDIO");
        //$("#NETWORKERROR").show();
      });
      audio.src = url;

      audio.load();
    }
    */
    //----------------------------------END OF BLOCK for preloading

    /*	sound1.once('play', function () {
                var time1 = sound1.duration();
                var timetoswitch1 = (time1 - fadeTime) * 1000;
                console.log(time1, timetoswitch1);
                var intTime = setTimeout (() => {
                    //var k = k + 2;
                    //loadingSound2 (k+2, list1, i);
                    sound2.play();
                        }, timetoswitch1);
        }) */


    /*	sound2.once('play', function () {

            var time2 = sound2.duration();
            var timetoswitch2 = (time2 - fadeTime) * 1000;
            console.log(time2, timetoswitch2);
            var intTime = setTimeout (() => {
                        //var i = i + 2;
                        //loadingSound1 (i+2, list1, k);
                        playSound1();
                }, timetoswitch2)
        })
    */
}

    function loadingSound1(i, playingList) {

        sound1 = new Howl({
            src: [playingList[i]],
            preload: true,
            html5: true,
            onplay: function () {
                var time1 = sound1.duration();
                var timetoswitch1 = time1 - fadeTime;

                var intervaller = setInterval(() => {
                    if (sound1.seek() >= timetoswitch1) {
                        sound2.play();
                        clearInterval(intervaller);
                    }
                    ;
                }, 500);

            },
            onpause: function () {
                clearInterval(intervaller)
            },
            onend: function () {
                //console.log('i = ' + i + 'k = ' + k);

                sound1.off();
                sound1.unload();

                var currentTime = new Date;
                var currentHour = currentTime.getHours();

                //listLength = playingList.length;
                //checking if all list was played or not
                //if not all then
                i = i + 2;
                loadingSound1(i, playingList);
            },
            onloaderror: function (e, msg) {
                console.log('sound1 onloaderrorrrr');
                console.log('Unable to load file: ' + playingList[i] + ' | error message : ' + msg);
                console.log('First argument error ' + e);
                sound1.off();
                i = i + 2;
                loadingSound1(i, playingList);
            }
            /*onend: function (i, list1) {
             if ((i+1) != listLength || (i+2) != listLength) {
                 var i = i + 2;
                 loadingSound1 (i, list1)
             }
            }*/
        })
    }

    function loadingSound2(k, playingList) {

        sound2 = new Howl({
            src: [playingList[k]],
            preload: true,
            html5: true,
            onplay: function () {
                var time2 = sound2.duration();
                var timetoswitch2 = time2 - fadeTime;

                var intervaller = setInterval(() => {

                    if (sound2.seek() >= timetoswitch2) {
                        sound1.play();
                        clearInterval(intervaller);
                    }
                    ;
                }, 500);
            },
            onpause: function () {
                clearInterval(intervaller)
            },
            onend: function () {

                sound2.off();
                sound2.unload();

                var currentTime = new Date;
                var currentHour = currentTime.getHours();
                //checking if all list was played or not (k+1) != listLength ||
                //if not all - then

                k = k + 2;
                loadingSound2(k, playingList);
            },
            onloaderror: function (e, msg) {
                console.log('sound2 onloaderrorrrr');
                console.log('Unable to load file: ' + playingList[k] + ' | error message : ' + msg);
                console.log('First argument error ' + e);
                sound2.off();
                k = k + 2;
                loadingSound2(k, playingList);
            }
        })
    }

    // Draft Start ---------

    // console.log({sound1Src: sound1._src})

    // Draft End --------

{
    // // $("#howler-play").on("click", function () {
    //
    //
    //     if (playPauseState == 0) {
    //
    //         loadingSound1(i, playingList);
    //         loadingSound2(k, playingList);
    //         sound1.play();
    //         console.log({sound1})
    //         console.log("initialiation complete");
    //
    //         playPauseState = "playing";
    //
    //     } else if (playPauseState == "playing") {
    //
    //         if (sound1.playing() && !sound2.playing()) {
    //             sound1.pause();
    //             pausedState = 1;
    //             console.log(pausedState);
    //         } else if (!sound1.playing() && sound2.playing()) {
    //             sound2.pause();
    //             pausedState = 2;
    //             console.log(pausedState);
    //         } else if (sound1.playing() && sound2.playing()) {
    //             sound1.pause();
    //             sound2.pause();
    //             pausedState = 3;
    //             console.log(pausedState);
    //         } else {
    //
    //         }
    //
    //         playPauseState = "paused";
    //         console.log("paused complete");
    //
    //     } else {
    //
    //         if (pausedState == 1) {
    //             sound1.play();
    //         } else if (pausedState == 2) {
    //             sound2.play();
    //         } else if (pausedState == 3) {
    //             sound1.play();
    //             sound2.play();
    //         }
    //
    //         playPauseState = "playing";
    //         console.log("playing complete");
    //
    //     }
    // // });
}

    $("#submitLike").on("click", function (e) {

        if (sound1.playing() && !sound2.playing()) {
            var song1name = sound1._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
            $("#songnameIdLike").val(song1name);
        } else if (!sound1.playing() && sound2.playing()) {
            var song2name = sound2._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
            $("#songnameIdLike").val(song2name);
        } else {
            //console.log("СЃРµСЂРґРµС‡РєРѕ РЅР°Р¶Р°Р»РѕСЃСЊ РЅР° РєСЂРѕСЃСЃС„РµР№РґРµ РёР»Рё Р±РµР· РјСѓР·С‹РєРё :(");
        }

        e.preventDefault();
        var jqxhr = $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            data: $formLike.serializeObject(),
            success: console.log("value sended")
        });
    });

    $("#submitDislike").on("click", function (e) {

        if (sound1.playing() && !sound2.playing()) {

            var song1name = sound1._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
            $("#songnameIdDislike").val(song1name);
        } else if (!sound1.playing() && sound2.playing()) {

            var song2name = sound2._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
            $("#songnameIdDislike").val(song2name);
        } else {
            //console.log("СЃРµСЂРґРµС‡РєРѕ РЅР°Р¶Р°Р»РѕСЃСЊ РЅР° РєСЂРѕСЃСЃС„РµР№РґРµ РёР»Рё Р±РµР· РјСѓР·С‹РєРё :(");
        }

        e.preventDefault();
        var jqxhr = $.ajax({
            url: url,
            method: "GET",
            dataType: "json",
            data: $formDislike.serializeObject(),
            success: console.log("value sended")
        });
    });

    $("#howler-volup").on("click", function () {
        var vol = howler_example.volume();
        vol += 0.1;
        if (vol > 1) {
            vol = 1;
        }
        howler_example.volume(vol);
    });

    $("#howler-voldown").on("click", function () {
        var vol = howler_example.volume();
        vol -= 0.1;
        if (vol < 0) {
            vol = 0;
        }
        howler_example.volume(vol);
    });

// });
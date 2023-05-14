var list1, list2, playingList, sound1, sound2, currentTime, pausedState;
var i = 0;
var k = 1;
var playPauseState = 0;

// -----======================================================CAHNGE HERE restaurant input field for FORM=========================================----
const projectFolderName = 'Sphere';
const placeUniqueName = 'Kusto';
$("input[name=place]").val(placeUniqueName);
const placeFolderName = `play${placeUniqueName}`;

const playlists = {
  'A': 'tracksA.txt',
  'B': 'tracksB.txt',
  // 'C': 'tracksC.txt'
}

//var for like/dislike func
var $formLike = $('form#formLike');
var $formDislike = $('form#formDislike');

//время начала проигрывания второго листа
const hourForPlayingList2 = 16;


const getPlaylist = (playlistName) => {
  const playlistFileName = playlists[playlistName]
  const url = `https://570427.selcdn.ru/${projectFolderName}/${placeFolderName}/${playlistFileName}`
  const options = {
    cache: 'no-cache',
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  }
  
  return fetch(url, options)
}


const fetchPlaylists = (playlistNamesArray) => {
  const promises = playlistNamesArray.map(name => getPlaylist(name))
  return Promise.all(promises)
}

const extractPlaylistsFromFetchResponse = response => {
  const promises = response.map(resp => resp.text())
  return Promise.all(promises)
}

const getTodaysPlaylist = () => {
  const today = new Date().getDay()
  let playlist = []
  
  if (today === 0) {
    // 0 is for sunday
    playlist = ['B', 'A']
  }
  
  if (today > 0 && today < 6) {
    playlist = ['A']
  }
  
  
  if (today === 6) {
    playlist = ['B', 'A']
  }
  
  return playlist
}

const playlistsToFetch = getTodaysPlaylist()
const onlyOnePlaylist = playlistsToFetch.length === 1

// fetch, shuffle, create links from songNames
// set lists (list2 will be undefined if there is only one playlist)
// set current playingList
fetchPlaylists(playlistsToFetch)
  .then(response => extractPlaylistsFromFetchResponse(response))
  .then(playlistStrings => playlistStrings.map(string => string.split(/\r\n|\r|\n/g)))
  .then(splittedPlaylists => splittedPlaylists.map(playlist => shuffle(playlist)))
  .then(shuffledPlaylists => {
    const [ shuffledUrls1, shuffledUrls2 ] = shuffledPlaylists.map(playlist => {
      return playlist.map(songName => `https://570427.selcdn.ru/Sphere/musiclibrary/${songName}`)
    })
    // console.log({listt1: shuffledUrls1, listt2: shuffledUrls2})
    list1 = shuffledUrls1
    list2 = shuffledUrls2
    
    //checking if time is for list1 or already for list2
    const currentHour = new Date().getHours();
    const playlist1Time = currentHour < hourForPlayingList2 && currentHour > 6
    if (playlist1Time || onlyOnePlaylist) {
      playingList = list1;
      console.log("playing list is 1");
    } //else time is already for list 2
    else {
      playingList = list2;
      console.log("playing list is 2");
    }
    
    console.log("playing list is", playingList);
    
    //console.log("shuffled list1" + list1);
    //console.log("shuffled list2" + list2);
    
    animateHowlerPlayButton();
  }).catch(error => console.error(error))


function loadingSound1(i) {
  
  sound1 = new Howl({
    src: [playingList[i]],
    preload: true,
    html5: true,
    onplay: function () {
      console.log("LOADING SOUND_1: the song name just started is — " + playingList[i])
      console.log("the i number is: " + i)
    },
    onend: function () {
      //console.log('i = ' + i + 'k = ' + k);
      sound2.play();
      
      sound1.off();
      sound1.unload();
      
      const currentHour = new Date().getHours();
      
      //listLength = playingList.length;
      //checking if all list was played or not
      //if not all then
      if (currentHour < hourForPlayingList2 || playingList == list2) {
        if ((i == (playingList.length - 1)) || (i == (playingList.length - 2))) {
          //console.log("playingList.length= " + playingList.length);
          //console.log("i= " + i);
          //console.log('from start now');
          i = 0;
          loadingSound1(i);
        } else {
          i = i + 2;
          loadingSound1(i);
        }
      } //else change the playing list on next one and load tracks from there
      else if (currentHour >= hourForPlayingList2 && k != 1) {
        if (onlyOnePlaylist === false) {
          i = 0;
        }
        // playingList = list2;
        playingList = onlyOnePlaylist ? list1 : list2;
        loadingSound1(i);
      } else {
        if (onlyOnePlaylist === false) {
          i = 1
        };
        // playingList = list2;
        playingList = onlyOnePlaylist ? list1 : list2;
        
        //new code after bag founding
        if ((i == (playingList.length - 1)) || (i == (playingList.length - 2))) {
          i = 0;
          loadingSound1(i);
        } else {
          i = i + 2;
          loadingSound1(i);
        }
        //end of new code after bag founding
        
      }
      
      sendLikeDislikeIfScheduled();
    },
    onloaderror: function (e, msg) {
      console.log('onloaderrorrrr');
      console.log('Unable to load file: ' + playingList[i] + ' | error message : ' + msg);
      console.log('First argument error ' + e);
      
      sound1.off();
      
      setTimeout(function () {
        
        if ((i == (playingList.length - 1)) || (i == (playingList.length - 2))) {
          i = 0;
          loadingSound1(i);
        } else {
          i = i + 2;
          loadingSound1(i);
        }
        
      }, 3000);
      
    }
    
  })
}

function loadingSound2(k) {
  
  sound2 = new Howl({
    src: [playingList[k]],
    preload: true,
    html5: true,
    onplay: function () {
      console.log("LOADING SOUND_2: the song name just started is — " + playingList[k])
      console.log("the k number is: " + k)
    },
    onend: function () {
      //console.log('k = ' + k);
      //listLength = playingList.length;
      sound1.play();
      
      sound2.off();
      sound2.unload();
      
      const currentHour = new Date().getHours();
      //checking if all list was played or not (k+1) != listLength ||
      //if not all - then
      if (currentHour < hourForPlayingList2 || playingList == list2) {
        
        if ((k == (playingList.length - 1)) || (k == (playingList.length - 2))) {
          k = 1;
          loadingSound2(k);
        } else {
          k = k + 2;
          loadingSound2(k);
        }
        
      } //else change the playing list on next one and load tracks from there
      else if (currentHour >= hourForPlayingList2 && i != 0) {
        if (onlyOnePlaylist === false) {
          k = 0;
        }
        playingList = onlyOnePlaylist ? list1 : list2;
        // playingList = list2;
        loadingSound2(k);
      } else {
        if (onlyOnePlaylist === false) {
          k = 1;
        }
        playingList = onlyOnePlaylist ? list1 : list2;
        // playingList = list2;
        //new code after bag founding
        if ((k == (playingList.length - 1)) || (k == (playingList.length - 2))) {
          k = 1;
          loadingSound2(k);
        } else {
          k = k + 2;
          loadingSound2(k);
        }
        //end of new code after bag founding
      }
      
      sendLikeDislikeIfScheduled();
    },
    onloaderror: function (e, msg) {
      console.log('onloaderrorrrr');
      console.log('Unable to load file: ' + playingList[k] + ' | error message : ' + msg);
      console.log('First argument error ' + e);
      
      sound2.off();
      
      setTimeout(function () {
        if ((k == (playingList.length - 1)) || (k == (playingList.length - 2))) {
          k = 1;
          loadingSound2(k);
        } else {
          k = k + 2;
          loadingSound2(k);
        }
      }, 3000);
      
    }
  })
}

$("#howler-play").on("click", function () {
  
  
  if (playPauseState == 0) {
    
    loadingSound1(i);
    loadingSound2(k);
    sound1.play();
    console.log("initialiation complete");
    
    playPauseState = "playing";
    
  } else if (playPauseState == "playing") {
    
    if (sound1.playing() && !sound2.playing()) {
      sound1.pause();
      pausedState = 1;
      console.log(pausedState);
    } else if (!sound1.playing() && sound2.playing()) {
      sound2.pause();
      pausedState = 2;
      console.log(pausedState);
    } else if (sound1.playing() && sound2.playing()) {
      sound1.pause();
      sound2.pause();
      pausedState = 3;
      console.log(pausedState);
    } else {
    
    }
    
    playPauseState = "paused";
    console.log("paused complete");
    
  } else {
    
    if (pausedState == 1) {
      sound1.play();
    } else if (pausedState == 2) {
      sound2.play();
    } else if (pausedState == 3) {
      sound1.play();
      sound2.play();
    }
    
    playPauseState = "playing";
    console.log("playing complete");
    
  }
  
});

addLikeDislikeClickHandlers();

function insertingLikeDislikeFormData() {
  
  if (playingList == list1) {
    const playlistTextName = playlistsToFetch[0]
    $("input[name=playlistname]").val(playlistTextName);
  } else if (playingList == list2) {
    const playlistTextName = playlistsToFetch[1]
    $("input[name=playlistname]").val(playlistTextName);
  }
  // else {
  //   $("input[name=playlistname]").val("non-basic playlist");
  // }
  
  if (sound1.playing() && !sound2.playing()) {
    //console.log(sound1._src.split("https://570427.selcdn.ru/Sphere/")[1]);
    var song1name = sound1._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
    $("input[name=songname]").val(song1name);
  } else if (!sound1.playing() && sound2.playing()) {
    //console.log(sound2._src.split("https://570427.selcdn.ru/Sphere/")[1]);
    var song2name = sound2._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
    $("input[name=songname]").val(song2name);
  } else {
    //console.log("сердечко нажалось на кроссфейде или без музыки :(");
  }
  
}

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


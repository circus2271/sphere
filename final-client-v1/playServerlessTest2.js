//const list1 = ['audio/1.m4a', 'audio/2.m4a', 'audio/3.m4a', 'audio/4.m4a'];
var list1, list2, list3, listLength, playingList, sound1, sound2, currentTime, pausedState;
var i = 0;
var k = 1;
var playPauseState = 0;
// $("#howler-play").hide(); // it is by default in css now (in inline css: 'visibility: hidden; opacity: 0;')
// document.querySelector("#howler-play").style.visibility = 'hidden' // another approach to hide the button

// -----======================================================CAHNGE HERE restaurant input field for FORM=========================================----

// --- projectFolderName
// projectFolderName can be some test folder
// for example 'test-bucket-container'
// or production folder, for example 'Sphere'
//
// const placeFolderName = 'Sphere'
const projectFolderName = 'test-bucket-container'

const placeUniqueName = 'playServerlessTest2'
$("input[name=place]").val(placeUniqueName);

const placeFolderName = placeUniqueName

// this syntax is used to make serverlessFunctionUrl global
// so we can use it in our login script
window['serverlessFunctionUrl'] = 'https://ru-1.gateway.serverless.selcloud.ru/api/v1/web/a111e1aadaa5439abf8153af6cb9d16c/default/test-gateway-api-manager'
// window['serverlessFunctionUrl'] = 'http://localhost:3000/sphere-api-middleware'

const playlists = {
  'Morning list': 'tracksMorning.txt',
  'Custom day list': 'customPlayListNameTracksDay.txt',
  'Custom night list': 'customTracksNight.txt'
}

//var for like/dislike func
var $formLike = $('form#formLike');
var $formDislike = $('form#formDislike');
// url = 'https://script.google.com/macros/s/AKfycbyV549CRxXuV25LGzS2BCj6IQzld6IWHTjFHYb7V-9ZmDRiOEnwYC1Ek0b71MTTTduSSQ/exec';


//(<any>this.sound)._src = newSrc;

//время начала проигрывания второго листа
const hourForPlayingList2 = 12;
const hourForPlayingList3 = 19;

//fade time in sec
const fadeTime = 2;


$.ajax({
  // -----======================================================CAHNGE HERE restaurant path=========================================----
  url: `https://570427.selcdn.ru/${projectFolderName}/${placeFolderName}/${playlists['Morning list']}`,
  contentType: "text/plain; charset=utf-8",
  success: function (data) {
    //parsing tracks.txt
    list1 = data.split(/\r\n|\r|\n/g);
    
    for (var i = 0; i < list1.length; i++) {
      list1[i] = "https://570427.selcdn.ru/Sphere/musiclibrary/" + list1[i];
    }
    
    shuffle(list1);
    ajaxingList2();
    
  },
  error: function () {
    console.log("failed to load tracks.txt")
  }
});


function ajaxingList2() {
  
  $.ajax({
    url: `https://570427.selcdn.ru/${projectFolderName}/${placeFolderName}/${playlists['Custom day list']}`,
    contentType: "text/plain; charset=utf-8",
    success: function (data) {
      //parsing tracks.txt
      list2 = data.split(/\r\n|\r|\n/g);
      
      for (var i = 0; i < list2.length; i++) {
        list2[i] = "https://570427.selcdn.ru/Sphere/musiclibrary/" + list2[i];
      }
      
      shuffle(list2);
      ajaxingList3();
    },
    error: function () {
      console.log("failed to load tracks1.txt")
    }
  })
}


function ajaxingList3() {
  
  $.ajax({
    url: `https://570427.selcdn.ru/${projectFolderName}/${placeFolderName}/${playlists['Custom night list']}`,
    contentType: "text/plain; charset=utf-8",
    success: function (data) {
      //parsing tracks.txt
      const parsed = data.split(/\r\n|\r|\n/g);
      
      // for (var i = 0; i < list3.length; i++) {
      //   list3[i] = "https://570427.selcdn.ru/Sphere/musiclibrary/" + list3[i];
      // }
      
      list3 = parsed.map(trackName => 'https://570427.selcdn.ru/Sphere/musiclibrary/' + trackName);
      
      var currentTime = new Date;
      var currentHour = currentTime.getHours();
      
      shuffle(list3);
      if (currentHour < hourForPlayingList2 && currentHour > 6) {
        playingList = list1;
        listLength = playingList.length;
        console.log("playing list is 1");
      } //else time is already for list 2
      else if (currentHour < hourForPlayingList3 && currentHour > 6) {
        playingList = list2;
        listLength = playingList.length;
        console.log("playing list is 2");
      } else {
        playingList = list3;
        listLength = playingList.length;
        console.log("playing list is 3");
      }
      
      // $("#howler-play").show();
      document.querySelector("#howler-play").style.transition = 'visibility, opacity 0.25s ease-in'
      document.querySelector("#howler-play").style.visibility = 'visible'
      document.querySelector("#howler-play").style.opacity = 1
    },
    error: function () {
      console.log("failed to load tracks3.txt")
    }
  })
}


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


function loadingSound1(i) {
  
  sound1 = new Howl({
    src: [playingList[i]],
    preload: true,
    html5: true,
    // volume: 0.1,
    onpause: function () {
      clearInterval(intervaller)
    },
    // onplay() {
    //   window.sound1 = sound1
    //   console.log('sound1 plays')
    // },
    // onload() {
    //   console.log('onload')
    //   window.sound1 = sound1
    //   const duration = sound1._duration
    //   console.log({ duration })
    //   window.sound1.seek(duration - 10)
    // },
    onend: function () {
      //console.log('i = ' + i + 'k = ' + k);
      sound2.play();
      
      sound1.off();
      sound1.unload();
      
      currentTime = new Date;
      currentHour = currentTime.getHours();
      
      //currentHour = currentTime.getMinutes();
      
      //listLength = playingList.length;
      //checking if all list was played or not
      //if not all then
      if (currentHour < hourForPlayingList2 || playingList == list3) {
        if ((i == (playingList.length - 1)) || (i == (playingList.length - 2))) {
          i = 0;
        } else {
          i = i + 2;
        }
        console.log("keeping same playlist, and upcoming track is " + playingList[i]);
      } //else change the playing list on next one and load tracks from there
      else if (currentHour >= hourForPlayingList2 && currentHour < hourForPlayingList3 && playingList != list2) {
        i = 0;
        playingList = list2;
        console.log("---------------------now the time for list2, and upcoming track is " + playingList[i]);
      } else if (currentHour >= hourForPlayingList3) {
        i = 0;
        playingList = list3;
        console.log("---------------------now the time for list3, and upcoming track is " + playingList[i])
      } else {
        if ((i == (playingList.length - 1)) || (i == (playingList.length - 2))) {
          i = 0;
        } else {
          i = i + 2;
        }
        console.log("keeping same playlist, and upcoming track is " + playingList[i]);
      }
      loadingSound1(i);
      
    },
    onloaderror: function (e, msg) {
      console.log('onloaderrorrrr');
      console.log('Unable to load file: ' + playingList[i] + ' | error message : ' + msg);
      console.log('First argument error ' + e);
      sound1.off();
      
      setTimeout(function () {
        
        if ((i == (playingList.length - 1)) || (i == (playingList.length - 2))) {
          i = 0;
        } else {
          i = i + 2;
        }
        loadingSound1(i);
      }, 3000);
    }
  })
}

function loadingSound2(k) {
  
  sound2 = new Howl({
    src: [playingList[k]],
    preload: true,
    html5: true,
    onpause: function () {
      clearInterval(intervaller)
    },
    // onplay() {
    //   window.sound2 = sound2
    //   console.log('sound2 plays')
    // },
    onend: function () {
      //console.log('k = ' + k);
      //listLength = playingList.length;
      sound1.play();
      
      sound2.off();
      sound2.unload();
      
      currentTime = new Date;
      currentHour = currentTime.getHours();
      //currentHour = currentTime.getMinutes();
      //checking if all list was played or not (k+1) != listLength ||
      //if not all - then
      if (currentHour < hourForPlayingList2 || playingList == list3) {
        if ((k == (playingList.length - 1)) || (k == (playingList.length - 2))) {
          k = 1;
        } else {
          k = k + 2;
        }
        console.log("keeping same playlist, and upcoming track is " + playingList[k]);
      } else if (currentHour >= hourForPlayingList2 && currentHour < hourForPlayingList3 && playingList != list2) {
        k = 1;
        playingList = list2;
        console.log("--------------------------now the time for list2, and upcoming track is " + playingList[k]);
      } else if (currentHour >= hourForPlayingList3) {
        k = 1;
        playingList = list3;
        console.log("--------------------------now the time for list3, and upcoming track is " + playingList[k]);
      } else {
        if ((k == (playingList.length - 1)) || (k == (playingList.length - 2))) {
          k = 1;
        } else {
          k = k + 2;
        }
        console.log("keeping same playlist, and upcoming track is " + playingList[k]);
      }
      loadingSound2(k);
    },
    onloaderror: function (e, msg) {
      console.log('onloaderrorrrr');
      console.log('Unable to load file: ' + playingList[k] + ' | error message : ' + msg);
      console.log('First argument error ' + e);
      sound2.off();
      
      setTimeout(function () {
        if ((k == (playingList.length - 1)) || (k == (playingList.length - 2))) {
          k = 1;
        } else {
          k = k + 2;
        }
        loadingSound2(k);
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

// only for test start
// setTimeout(() => $("#howler-play")[0].click()
//   , 2000)
// only for test end


// $("#howler-play")[0].click()
$("#submitLike").on("click", function (e) {
  
  if (sound1 == undefined || sound2 === undefined) {
    console.error('Error! Start player to enable likes');
    return;
  }
  
  insertingLikeDislikeFormData();
  
  // console.log({ formData: $$formLike.serializeObject() })
  const formData = $formLike.serializeObject();
  const requestData = {
    ...$formLike.serializeObject(),
    login: formData.place,
    password: localStorage.getItem('password')
  }
  // console.log({requestData})
  
  setTimeout(function () {
    e.preventDefault();
    var jqxhr = $.ajax({
      // url: url,
      // url: 'http://localhost:3200/sphere-api-middleware',
      url: serverlessFunctionUrl,
      method: "POST",
      contentType: 'application/json',
      dataType: "json",
      // data: JSON.stringify($formLike.serializeObject()),
      data: JSON.stringify(requestData),
      success: console.log("value sended")
    })
      .done(function (res) {
        if (res.result === 'success') console.log(res.message);
        if (res.result === 'error') console.error(res.message);
      });
    ;
  }, 3000);
});

$("#submitDislike").on("click", function (e) {
  
  if (sound1 == undefined || sound2 === undefined) {
    console.error('Error! Start player to enable dislikes');
    return;
  }
  
  insertingLikeDislikeFormData();
  
  // console.log({ formData: $formDislike.serializeObject() })
  const formData = $formDislike.serializeObject();
  const requestData = {
    ...$formDislike.serializeObject(),
    login: formData.place,
    password: localStorage.getItem('password'),
    playlistFileName: playlists[formData.playlistname],
    projectFolderName
  }
  // console.log(requestData);
  
  setTimeout(function () {
    e.preventDefault();
    var jqxhr = $.ajax({
      // url: url,
      // url: 'http://localhost:3200/sphere-api-middleware',
      url: serverlessFunctionUrl,
      method: "POST",
      contentType: 'application/json',
      dataType: "json",
      // data: JSON.stringify($formDislike.serializeObject()),
      data: JSON.stringify(requestData),
      success: console.log("value sended")
    })
      .done(function (res) {
        if (res.result === 'success') console.log(res.message);
        if (res.result === 'error') console.error(res.message);
      });
  }, 3000);
});

function insertingLikeDislikeFormData() {
  
  if (playingList == list1) {
    $("input[name=playlistname]").val("Morning list");
  } else if (playingList == list2) {
    $("input[name=playlistname]").val("Custom day list");
  } else if (playingList == list3) {
    $("input[name=playlistname]").val("Custom night list");
  } else {
    $("input[name=playlistname]").val("non-basic playlist");
  }
  
  if (sound1.playing() && !sound2.playing()) {
    var song1name = sound1._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
    $("input[name=songname]").val(song1name);
  } else if (!sound1.playing() && sound2.playing()) {
    var song2name = sound2._src.split("https://570427.selcdn.ru/Sphere/musiclibrary/")[1];
    $("input[name=songname]").val(song2name);
  } else {
    // TODO: sometimes "crossfaded" is sent like a songname
    $("input[name=songname]").val("crossfaded");
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
  

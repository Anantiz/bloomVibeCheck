## Saturday

### 13:30

First there was React, A library. Then came React-Native a Framework and Language, that happens to use JavaScript. And some time after a person decided to make "Expo" such that it would be easier to write Code for React-Native. And also we have Typescript that gets trasnpiled into JavaScript that gets embeded in the react Native Compiled app ...

Taxonomy is simpler than this smh.

"""
Development Tools: Expo provides a convenient mobile app and web interface for testing your application on real devices without going through the lengthy app store submission process for every test build.
"""
Well I guess APKs/IPAs can go get screwed. /j
Nah, that's clever actually.


### 14:30 Looked up the core Stack:

Expo coupled with Expo-Go and Metro Hot-reload is genuienly brilliant. Definitely a crucial and power full tool for fast mobile dev.

Expo: Run server on Pc -> QR-code with network ip -> Phones lookup download over Wi-fi -> Expo-go Loads the Js Package and runt it direclty;
Brilliant


### 15:16. Going for a 5min walk; Will dive directly in Expo afterwards

### 15:40 Back from the walk

Wow, adhd meds makes walking in the city much better, I don't find my city that ugly anymore 

### 17:00 Wanted to make an ArenaAllocator to Optimize MusicNotes for l2 cache. Ts/Js doesn't have pointers

I am now thinking about ending it all. Is life even worth living after learning this ?

### 17:17

Notes: 
/types/ are separates from OOP-style classes because we Separate Pure-data and Data-With-behavior.

"lib/ contains reusable, framework-agnostic logic" -> "Your piano roll engine should work the same in React Native, web, or even Node.jsYour piano roll engine should work the same in React Native, web, or even Node.js"
Makes sense

### 19:50 Wasted time like an idiot to make an Arena Allocator; Attacking Audio samples loading and Audio Playback

Hopefully Expo should handle all of this super cleanly.

### 22:00

ALTER ! Was ist "Zustand" jetz; Ich glaubte wir hatten EXPO, AAAAAA smk (Schuttle den Kopf)

### 22:25: Why Is there No FileName conventions ... :c I bet Rust/Python one is not the most adopted. Whatever

Also: THere is toooooooooooo much damn files Everywhere at once; That's so chaotic; wtf u mean 6K directories and 30K files ?


### 23:50 Lost focus since 20mins ago; Going to sleep bye bye


## Sunday 8:40 Back at it
9:18: 😴

### 11:15: Lost my mind over buffer-issues that have to be solved in 4 different files at the same time

### 11:36: Finally FIxed re-render that wouldn't trigger; It's not optimized and redraw almost everything but it's good enough for now.
Failed to resolve the Android SDK path. Default install location not found: /home/myos/Android/sdk. Use ANDROID_HOME to set the Android SDK location.

ALSO THAT'S GOING TO BE ANNOYING

### 12:40: Real-time audio is annoying (bad Os-Api for cross platform); We'll do pre-computed single audio


### 12:50 So yesterday I nerded out and wastedtime with an Arena alocator; Now I'm nerding out on Audio processing burh; I ain't shipping by monday this way lmfao

TIL: polyfills is not a an equations algorithm to fill a polygon

### 14:00 WHY THE FCK Is it so Unbelieveably Complicated to have a common fileSystem and AudioEngine in Cross-paltform Mobile AAAAAAAAAA

14:20: Attempting to make an LLM code a pure Js audio decoder cuz apparently loading a file is off-limits for cross-platform capabilities (I don't undersatand at all why woud something this simple not be ...)

### 14:40 Dark is the night


### 15:15: Stepped back; Outlined Done-To_be_done; Decomposed issues:
- Start/Stop playback -> should work, just async is different than python
- Decoder: Fix it step by step

Turns out: It just works if I use .vaw instead of .ogg ; That's disapointing

### 16:15: I learned the Reality of JS coroutines/Promises ... disgusting


### 16:40: Understood the async pattern of JS finally:


export function startPlayback(partition: Partition): PlaybackController {
  console.log(`Starting playback for partition: ${partition}`);
  const controller = new PlaybackController();

  // Start playback async but don't await - let it run in background
  controller.startPlaybackAsync(partition, PLAYBACK_BPM)
    .then(result => {
      console.log('Playback completed successfully', result);
    })
    .catch(error => {
      if (error.message !== 'Playback cancelled') {
        console.error('Playback failed:', error);
      }
    });

  return controller;
}

IS AKIN TO: (python async)

def foo():
  def async _inner_detached():
    try:
      result = await controller.startPlaybackAsync(partition, PLAYBACK_BPM)
      console.log('Playback completed successfully', result);
    Expect error:
      if (error.message !== 'Playback cancelled')
        console.error('Playback failed:', error);

  const controller = get()
  _ = asyncio.create_task(_inner_detached()) // detached
  return controller;


I HOWEVER, won't look at where promise.then() is stored in memory to space myself a suicide attempt.
I'll treat it like a Blackbox Oracle, that's fine

### 17:00: Quod non potes mutare, accipe.

### 18:10 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

CA MAAAAAAAAAAARRRRRRRRRCHHHHHHHHEEEEEEEEEEEEEEEEEEEE
IL YA DU BRUIT !!!!

### 19:20 Works fine on web-view ; Can't make expo-go work tho

Turns out I gotta Fix my NixOs firewall and network config, my lazyass 2500 lines flake config caught me back
I should really clean that shit Up someday

### 20:00: Cross platform is half-true half-lie in react Native :c (Most likely I'm just a dumbass)
Now I import foo from module; And module.web or module.native gets called automatically.
Quite clever concept: But it's supposed to be cross platfrom tho ...

### 21:30:  Well, loading assets in mobile is an other story itself; And then the audio is not available by default ...

### 22:30 FUCKING FINALY

## Monday

### 1:30 am Just vibing

tbf, i stat to not hate react/ts anymore

### 2:50: If you manually change the URl you can go to piano-roll without being logged. Will I fix that ? (hell nah)
At least: it doesn't cause issue; it's as invite. cannot save cannot load; it's not so bad

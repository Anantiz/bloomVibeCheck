### Midi-Roll-Share

**POV: You love David so you make an app to share melody drafts together**

### Preface:

**I will make this project over the week end to:**
- Learn about the whole TypeScript and mobile developer experience
- Demonstrate I'm Lightning McQueen *KACHOW*

### Overview (developement plan actually):

**Backend**
Use Convex.

*main components*
- Register user, Safe Auth
- Save music projects

**Frontend**
Use Expo & react-native

*main components*
- Midi-roll, play back Samples, (Guitar & Piano - Forcing a modular architecture)
- Save and Load midi-songs (remote)
- Explore-page where users can share their projects with anyone

**Deployment**

A docker-compose with 2 containers:
- The Backend end, a script that will deploy Convex
- A container that will host a Web Android-Emulator to run the app (I won't make you install a sketchy APK)
- A nix-flake (NixOs btw)


### Execution plan:

1. Learn Convex
2. Learn Expo and what it has to do with React
3. Define Blocks of Logics for each service
4. Run something with these dockers
5. Realize that these logic blocks where bad - Reset (you ran and saw it was bad)
6. Define all blocks again, cleanly
7. Implement Each blocks one by one - ~~Backend-first (6h)~~ - Start with front as it can work independently (and is more fun) - then Back to Back *haha*
8. Profit 🥺👉👈

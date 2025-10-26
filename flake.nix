{
  description = "Midi-Roll-Share - Expo + Convex";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    # Optional: For more precise Android SDK control
    # android-nixpkgs.url = "github:tadfisher/android-nixpkgs";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true; # Accept Android SDK licenses
          };
        };

        nodejs = pkgs.nodejs_20;

        # Define Android SDK composition
        androidComposition = pkgs.androidenv.composeAndroidPackages {
          cmdLineToolsVersion = "8.0";
          toolsVersion = "26.1.1";
          platformToolsVersion = "34.0.5";
          buildToolsVersions = [ "34.0.0" ];
          platformVersions = [ "34" ];
          includeNDK = true;
          ndkVersion = "25.1.8937393";
          includeSources = false;
          includeSystemImages = false;
          useGoogleAPIs = false;
        };

        androidSdk = androidComposition.androidsdk;

        projectDeps = with pkgs; [
          nodejs
          yarn
          git
          python3
          pkg-config

          # Android development
          androidSdk
          jdk17 # Use a pinned JDK version

          # Native dependencies for audio libraries and NDK
          alsa-lib
          libpulseaudio
          # Fix for NDK linker issues [citation:2]
          libxml2

        ] ++ lib.optionals stdenv.isLinux [
          # ADB and udev rules are handled via system config
          android-udev-rules
        ];

      in {
        devShells.default = pkgs.mkShell {
          buildInputs = projectDeps;

          # Critical environment variables for Android builds
          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"

            # Android SDK environment [citation:9]
            export ANDROID_SDK_ROOT="${androidSdk}/libexec/android-sdk"
            export ANDROID_HOME="$ANDROID_SDK_ROOT"
            export ANDROID_NDK_ROOT="$ANDROID_SDK_ROOT/ndk-bundle"

            # Java environment
            export JAVA_HOME="${pkgs.jdk17.home}"

            # Tell Gradle to use the Nix-provided aapt2 [citation:4][citation:9]
            export GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=$ANDROID_SDK_ROOT/build-tools/34.0.0/aapt2"

            # Fix for NDK linker issues [citation:2]
            export LD_LIBRARY_PATH="${pkgs.libxml2.out}/lib:$LD_LIBRARY_PATH"

            echo "🎵 Midi-Roll-Share Development Environment"
            echo ""
            echo "Android SDK configured: $ANDROID_SDK_ROOT"
            echo ""
            echo "Quick start:"
            echo "  npm install          # Install dependencies (includes convex)"
            echo "  npx expo start       # Start Expo dev server"
            echo "  npx convex dev       # Start Convex backend"
            echo ""
            echo "Scan QR code with Expo Go app on your phone!"
          '';

          EXPO_DEVTOOLS_LISTEN_ADDRESS = "0.0.0.0";
        };
      }
    );
}
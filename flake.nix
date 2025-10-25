{
  description = "Midi-Roll-Share - Expo + Convex";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        nodejs = pkgs.nodejs_20;

        projectDeps = with pkgs; [
          nodejs
          yarn
          git

          # Convex CLI globally for convenience
          nodePackages.convex

          # Native deps for potential audio libraries
          python3
          pkg-config
        ] ++ lib.optionals stdenv.isLinux [
          alsa-lib
          libpulseaudio
        ];

      in {
        devShells.default = pkgs.mkShell {
          buildInputs = projectDeps;

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"

            echo "🎵 Midi-Roll-Share Development Environment"
            echo ""
            echo "Quick start:"
            echo "  npm install          # Install dependencies"
            echo "  npx expo start       # Start Expo dev server"
            echo "  npx convex dev       # Start Convex backend"
            echo ""
            echo "Scan QR code with Expo Go app on your phone!"
          '';

          # Expo environment
          EXPO_DEVTOOLS_LISTEN_ADDRESS = "0.0.0.0";
        };
      }
    );
}
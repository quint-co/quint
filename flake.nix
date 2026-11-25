{
  description = "An executable specification language";

  inputs = { nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable"; };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs_20
            pkgs.jre # for antlr4ts
            pkgs.nodePackages.yalc
            pkgs.vsce
            pkgs.parallel
          ] ++ pkgs.lib.optionals pkgs.stdenv.isDarwin [
            pkgs.libiconv
            pkgs.darwin.apple_sdk.frameworks.CoreFoundation
          ];

          shellHook = "npm config set prefix ~/.npm";
        };

        # Lean through Veil: `make -C lean …` and `quint verify --backend veil`. The
        # elan is nixpkgs', which patches each toolchain it installs to run on NixOS
        # and has `lake` link through Nix's cc, so Veil's compiled checkers run too.
        # The generic elan that `quint` downloads when none is on PATH runs neither.
        devShells.lean = pkgs.mkShell {
          buildInputs = with pkgs; [
            elan
            # lean-cvc5 builds its FFI with the `clang` on PATH, against libc++.
            llvmPackages.libcxxClang
            nodejs_20 # `make -C lean test` builds the `quint` that compiles the specs
            gnumake
            git # Lake clones Veil and its dependencies
            curl
            unzip # Lake fetches cvc5's release archive
          ];
        };
      });
}

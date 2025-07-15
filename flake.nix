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
          ];

          shellHook = "npm config set prefix ~/.npm";
        };
      });
}

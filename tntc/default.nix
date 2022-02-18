with (import <nixpkgs> {});
let
  shell = mkShell {
    name = "typescript-env";
    buildInputs = [
      pkgs.nodejs-16_x
      pkgs.jre # for antlr4ts
    ];
  };
in
shell

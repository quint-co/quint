with (import <nixpkgs> { });
pkgs.mkShell {
  name = "quint-documentation-env";
  buildInputs = [ pkgs.go ];
  shellHook = ''
    go install github.com/driusan/lmt@latest
    export PATH=$PATH:$(go env GOPATH)/bin
  '';
}

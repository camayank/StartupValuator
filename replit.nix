{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.util-linux
    pkgs.chromium
    pkgs.cairo
    pkgs.pango
    pkgs.pkg-config
    pkgs.pixman
  ];
}

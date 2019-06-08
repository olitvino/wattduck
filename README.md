# wattduck🦆
A watt usage indicator extension for the gnome-shell

![wattduck in action](https://github.com/osphost/wattduck/raw/master/media/gnome-taskbar-full.png "wattduck in action")

## about
wattduck provides a simple indicator for battery power usage to the gnome-shell status bar.
It aims to be fast, efficient, simple and clean.
wattduck works by asynchronously polling `/sys/class/power_supply/BAT*/power_now` and has been tested
under `archlinux` and `manjaro`.

## installation
wattduck will soon be available the gnome-extensions site and on the AUR. 
For manual installation, simply extract the `wattduck@osphost.github.com` folder to `/usr/share/gnome-shell/extensions/` and restart your gnome-shell session by holding `alt + F2` and then entering `r` into the gnome command dialog.

## feature roadmap
 - additional display options
 - process based power consumption via `powertop` or similar
 - process based power consumption warnings, similar to macOS.

## contribute
Contributors welcome. If you would like to help, please just create a ticket.

## license
Licensed under GPL v3.0

# wattduck
A watt usage indicator extension for the gnome-shell

![wattduck in action](https://github.com/osphost/wattduck/raw/master/media/gnome-taskbar-full.png "wattduck in action")

## about
wattduck provides a simple indicator for battery power usage to the gnome-shell status bar.
It aims to be fast, efficient, simple and clean.
wattduck works by asynchronously polling `/sys/class/power_supply/BAT*/power_now` and has been tested
under `archlinux` and `manjaro`.

## feature roadmap
 - additional display options
 - process based power consumption via `powertop` or similar
 - process based power consumption warnings, similar to macOS.

## contribute
Contributors welcome. If you would like to help, please just create a ticket.


const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;

/**
 * Interval for executing battery measurement and UI update
 */
const CHECK_INTERVAL_SEC = 20;

/**
 * Path for shell file execution
 */
const WATT_READ_SHELL_FILE = Me.dir.get_path() + '/watt_read.sh';

/**
 * Display modes
 * TODO: Only DISPLAY_MODE_SUM is supported for now
 */
const DISPLAY_MODE_INDIVIDUAL = 'individual';
const DISPLAY_MODE_SUM = 'sum';
const DISPLAY_MODE = DISPLAY_MODE_SUM;

let indicator, timeout, updateProcess_stream, updateProcess_sourceId, updateProcess_pid;

/**
 * Indicator Panel Menu Button for displaying the wattage to the user
 * @private
 */
const IndicatorButton = new Lang.Class({
    Name: "wattduckButton",
    Extends: PanelMenu.Button,

    _init: function () {
        this.parent(null, "wattduckButton");

        // The indicator label
        this.label = new St.Label({
            text: '0W',
            style_class: "system-status-icon",
            track_hover: true,
            y_align: Clutter.ActorAlign.CENTER,
        });

        this.actor.add_actor(this.label);

        // Build the popup menu
        this.githubMenuItem = new PopupMenu.PopupMenuItem('Github', {});
        this.githubMenuItem.connect('activate', function() {
            Util.spawn(["xdg-open", "https://github.com/osphost/wattduck"]);
        });
        this.menu.addMenuItem(this.githubMenuItem);
    }
});

/**
 * Check for updates by asynchronously steaming the executed shell file
 * @private
 */
function _checkUpdates() {
    try {
        // Parse check command line
        let [parseok, argvp] = GLib.shell_parse_argv(WATT_READ_SHELL_FILE);
        if (!parseok) { throw 'Parse error' };

        let [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(
            null,
            argvp,
            null,
            GLib.SpawnFlags.DO_NOT_REAP_CHILD,
            null
        );

        // Let's buffer the command's output - that's a input for us !
        updateProcess_stream = new Gio.DataInputStream({
            base_stream: new Gio.UnixInputStream({fd: out_fd})
        });

        // We will process the output at once when it's done
        updateProcess_sourceId = GLib.child_watch_add(0, pid, function() {
            _checkUpdatesRead();
        });

        updateProcess_pid = pid;
    } catch (err) {
        global.log(err.message.toString());
    }
}

/**
 * Process the measured and parsed battery values
 * @private
 * @param {String[]} batteryList
 */
function _processValues(batteryList) {
    // TODO: Add configuration for displaying each individual battery reading, or the sum of
    if (batteryList.length > 1 && DISPLAY_MODE === DISPLAY_MODE_INDIVIDUAL) {
        const processed = batteryList.map(function(parsedValue) {
            const numerical = Number.parseInt(parsedValue, 10) / 1000000;
            return numerical.toString() + 'W';
        });
        indicator.label.text = processed.join(', ');
    } else {
        let total = 0;
        batteryList.forEach(function(parsedValue) {
            total += Number.parseInt(parsedValue, 10) / 1000000;
            return ;
        });
        indicator.label.text = total.toString() + 'W';
    }
}

/**
 * Executes the async stream reading from the shell output
 * @private
 */
function _checkUpdatesRead() {
    // Read the buffered output
    let batteryList = [];
    let out;

    do {
        [out] = updateProcess_stream.read_line_utf8(null);
        if (out) batteryList.push(out);
    } while (out);

    _checkUpdatesEnd();
    _processValues(batteryList);
}

/**
 * Cleans up the async reading resources
 * @private
 */
function _checkUpdatesEnd() {
    updateProcess_stream.close(null);
    updateProcess_stream = null;
    GLib.source_remove(updateProcess_sourceId);
    updateProcess_sourceId = null;
    updateProcess_pid = null;
}

/**
 * Removes the timeout/timer from the main loop
 * @private
 */
function _removeTimeout() {
    if (timeout) {
        Mainloop.source_remove(timeout);
        timeout = null;
    }
}

/**
 * Executes a timed loop
 * @private
 */
function _refresh() {
    _removeTimeout();
    _checkUpdates();
    timeout = Mainloop.timeout_add_seconds(CHECK_INTERVAL_SEC, _refresh);
    return true;
}

/**
 * Enables the extension
 * @public
 */
function enable() {
    _refresh();
    Main.panel.statusArea['wattduck-indicator'].actor.visible = true;
}

/**
 * Disables the extension
 * @public
 */
function disable() {
    Main.panel.statusArea['wattduck-indicator'].actor.visible = false;
    _removeTimeout();
}

/**
 * Initialises the extension
 * @public
 */
function init() {
    indicator = new IndicatorButton();
    Main.panel.addToStatusArea('wattduck-indicator', indicator);
    _refresh();
}


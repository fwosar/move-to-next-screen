import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import Meta from "gi://Meta";
import Shell from "gi://Shell";

export default class MoveToNextScreenExtension extends Extension {

    constructor(metadata) {
        super(metadata);
        this._settings = null;
    }

    getScreenCount() {
        return global.workspace_manager
            .get_active_workspace()
            .get_display()
            .get_n_monitors();
    }

    getActiveWindow() {
        return global.workspace_manager
            .get_active_workspace()
            .list_windows()
            .find(window => window.has_focus());
    }

    moveToScreenByOffset(offset) {
        let window = this.getActiveWindow();

        if (!window) {
            console.warn("No focused window - ignoring keyboard shortcut to move window");
            return;
        }

        let screenCount = this.getScreenCount();

        if (screenCount <= 1) {
            console.warn("Only one monitor - ignoring keyboard shortcut to move window");
            return;
        }

        let newScreen = window.get_monitor() + offset;

        if (newScreen < 0) {
            newScreen = screenCount - 1;
        } 
        else
        {
            newScreen = newScreen % screenCount;
        }

        window.move_to_monitor(newScreen);
    }

    moveToNextScreenHandler() {
        this.moveToScreenByOffset(1);
    }

    moveToPreviousScreenHandler() {
        this.moveToScreenByOffset(-1);
    }

    enable() {
        this._settings = this.getSettings();
        Main.wm.addKeybinding("move-window-to-next-screen-shortcut", this._settings, Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW, this.moveToNextScreenHandler.bind(this));
        Main.wm.addKeybinding("move-window-to-previous-screen-shortcut", this._settings, Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW, this.moveToPreviousScreenHandler.bind(this));
    }

    disable() {
        Main.wm.removeKeybinding("move-window-to-next-screen-shortcut");
        Main.wm.removeKeybinding("move-window-to-previous-screen-shortcut");
        this._settings = null;
    }
}

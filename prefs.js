import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import GObject from 'gi://GObject';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

// Shortcuts group class
const ShortcutsGroup = GObject.registerClass(
class ShortcutsGroup extends Adw.PreferencesGroup {
    _init(settings) {
        super._init({
            title: _('Shortcuts'),
            description: _('Configure the keyboard shortcuts used by the extension')
        });

        this._settings = settings;

        // Add shortcut rows
        this.addShortcutRow("move-window-to-next-screen-shortcut", "Move current window to next screen");
        this.addShortcutRow("move-window-to-previous-screen-shortcut", "Move current window to previous screen");
    }

    addShortcutRow(settingName, title, subtitle) {
        // Create a row for the shortcut
        const row = new Adw.ActionRow({
            title: title
        });

        // Create the shortcut button
        const button = new Gtk.Button({
            valign: Gtk.Align.CENTER,
            css_classes: ['flat']
        });
        
        // Update button label
        const updateButtonLabel = () => {
            const accelerator = this._settings.get_strv(settingName)[0];
            button.label = accelerator || 'Disabled';
        };
        
        updateButtonLabel();

        // Handle button click
        button.connect('clicked', () => {
            // Create the shortcut dialog
            const dialog = new Gtk.Dialog({
                title: `Set Shortcut for ${title}`,
                modal: true,
                use_header_bar: 1,
                transient_for: this.get_root(),
                width_request: 400,
            });

            // Add cancel button
            dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
            
            // Create content for the dialog
            const content = dialog.get_content_area();
            content.append(new Gtk.Label({
                label: 'Press any key combination...\nPress Esc to cancel, Backspace to disable',
                margin_top: 12,
                margin_bottom: 12,
                margin_start: 12,
                margin_end: 12
            }));

            // Show the dialog
            dialog.show();

            // Handle key events
            const eventController = new Gtk.EventControllerKey();
            dialog.add_controller(eventController);

            eventController.connect('key-pressed', (_controller, keyval, keycode, state) => {
                let mask = state & Gtk.accelerator_get_default_mod_mask();
                
                // Handle Escape key
                if (keyval === Gdk.KEY_Escape) {
                    dialog.close();
                    return Gdk.EVENT_STOP;
                }

                // Handle Backspace key (disable shortcut)
                if (keyval === Gdk.KEY_BackSpace) {
                    this._settings.set_strv(settingName, []);
                    updateButtonLabel();
                    dialog.close();
                    return Gdk.EVENT_STOP;
                }

                // Ignore standalone modifier keys
                if (keyval === Gdk.KEY_Control_L || keyval === Gdk.KEY_Control_R ||
                    keyval === Gdk.KEY_Shift_L   || keyval === Gdk.KEY_Shift_R   ||
                    keyval === Gdk.KEY_Alt_L     || keyval === Gdk.KEY_Alt_R     ||
                    keyval === Gdk.KEY_Super_L   || keyval === Gdk.KEY_Super_R) {
                    return Gdk.EVENT_STOP;
                }

                // Create accelerator
                let accelerator = Gtk.accelerator_name(keyval, mask);
                if (accelerator) {
                    this._settings.set_strv(settingName, [accelerator]);
                    updateButtonLabel();
                    dialog.close();
                }

                return Gdk.EVENT_STOP;
            });
        });

        // Monitor settings changes
        this._settings.connect(`changed::${settingName}`, updateButtonLabel);

        // Add button to row
        row.add_suffix(button);
        row.activatable_widget = button;
        
        // Add row to group
        this.add(row);
    }
});

// Main preferences class
export default class MoveToNextScreenPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });

        // Create our shortcuts group with the extension's settings
        const group = new ShortcutsGroup(this.getSettings());
        
        // Add the group to the page
        page.add(group);
        
        // Add the page to the window
        window.add(page);
    }
}
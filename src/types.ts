import {
    IMIDIInput,
    IMIDIOutput,
    MIDIValInput,
    MIDIValOutput,
} from '@midival/core';

export type MidiDeviceDescriptor = {
    name: string;
    manufacturer: string;
};

type InputMidiDeviceConnectedEvent = {
    type: 'input_connected';
    device: IMIDIInput;
};

type InputMidiDeviceDisconnectedEvent = {
    type: 'input_disconnected';
    device: IMIDIInput;
};

export const MidiEventMatchers = {
    isInputConnectedEvent: (
        event: MidiDeviceChangeEvent,
    ): event is InputMidiDeviceConnectedEvent => {
        return event.type === 'input_connected';
    },
    isInputDisconnectedEvent: (
        event: MidiDeviceChangeEvent,
    ): event is InputMidiDeviceDisconnectedEvent => {
        return event.type === 'input_disconnected';
    },
    isOutputConnectedEvent: (
        event: MidiDeviceChangeEvent,
    ): event is OutputMidiDeviceConnectedEvent => {
        return event.type === 'output_connected';
    },
    isOutputDisconnectedEvent: (
        event: MidiDeviceChangeEvent,
    ): event is OutputMidiDeviceDisconnectedEvent => {
        return event.type === 'output_disconnected';
    },
};

export const isSameMidiDevice = (
    a: MidiDeviceDescriptor,
    b: MidiDeviceDescriptor,
): boolean => {
    return a.name === b.name && a.manufacturer === b.manufacturer;
};

type OutputMidiDeviceConnectedEvent = {
    type: 'output_connected';
    device: IMIDIOutput;
};

type OutputMidiDeviceDisconnectedEvent = {
    type: 'output_disconnected';
    device: IMIDIOutput;
};

export type MidiDeviceChangeEvent =
    | InputMidiDeviceConnectedEvent
    | InputMidiDeviceDisconnectedEvent
    | OutputMidiDeviceConnectedEvent
    | OutputMidiDeviceDisconnectedEvent;

export interface MidiInput extends Omit<MIDIValInput, 'midiInput'> {
    midiInput: IMIDIInput;
}
export interface MidiOutput extends Omit<MIDIValOutput, 'midiOutput'> {
    midiOutput: IMIDIOutput;
}

export type CurrentMidiDeviceState = {
    connectedInputDevices: MidiInput[];
    connectedOutputDevices: MidiOutput[];
};

export type MidiDeviceChangeMessage = {
    state: CurrentMidiDeviceState;
    events?: MidiDeviceChangeEvent[];
};

export const getTextForEvents = (events: MidiDeviceChangeEvent[]): string => {
    let newConnectedDevices: string[] = [];
    let newDisconnectedDevices: string[] = [];
    for (const event of events) {
        switch (true) {
            case MidiEventMatchers.isInputConnectedEvent(event): {
                newConnectedDevices.push(event.device.name);
                break;
            }
            case MidiEventMatchers.isInputDisconnectedEvent(event): {
                newDisconnectedDevices.push(event.device.name);
                break;
            }
            case MidiEventMatchers.isOutputConnectedEvent(event): {
                newConnectedDevices.push(event.device.name);
                break;
            }
            case MidiEventMatchers.isOutputDisconnectedEvent(event): {
                newDisconnectedDevices.push(event.device.name);
                break;
            }
        }
    }

    let text = '';
    newConnectedDevices = Array.from(new Set(newConnectedDevices));
    newDisconnectedDevices = Array.from(new Set(newDisconnectedDevices));

    if (newConnectedDevices.length) {
        text += `Connected:\n${newConnectedDevices.join('\n')}`;
    }

    if (newDisconnectedDevices.length) {
        if (text.length) {
            text += '\n';
        }
        text += `Disconnected:\n${newDisconnectedDevices.join('\n')}`;
    }

    if (!text.length) {
        text = 'No new device connections';
    }

    return text;
};

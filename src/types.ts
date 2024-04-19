import {IMIDIInput, IMIDIOutput} from '@midival/core';

type InputMidiDeviceConnectedEvent = {
    type: 'input_connected';
    device: IMIDIInput;
}

type InputMidiDeviceDisconnectedEvent = {
    type: 'input_disconnected';
    device: IMIDIInput;
}

export const MidiEventMatchers = {
    isInputConnectedEvent: (event: MidiDeviceChangeEvent): event is InputMidiDeviceConnectedEvent => {
        return event.type === 'input_connected';
    },
    isInputDisconnectedEvent: (event: MidiDeviceChangeEvent): event is InputMidiDeviceDisconnectedEvent => {
        return event.type === 'input_disconnected';
    },
    isOutputConnectedEvent: (event: MidiDeviceChangeEvent): event is OutputMidiDeviceConnectedEvent => {
        return event.type === 'output_connected';
    },
    isOutputDisconnectedEvent: (event: MidiDeviceChangeEvent): event is OutputMidiDeviceDisconnectedEvent => {
        return event.type === 'output_disconnected';
    },
}

export const isSameMidiDevice = (a: IMIDIInput | IMIDIOutput, b: IMIDIInput | IMIDIOutput): boolean => {
    return a.name === b.name && a.manufacturer === b.manufacturer;
}

type OutputMidiDeviceConnectedEvent = {
    type: 'output_connected';
    device: IMIDIOutput;
}

type OutputMidiDeviceDisconnectedEvent = {
    type: 'output_disconnected';
    device: IMIDIOutput;
}

export type MidiDeviceChangeEvent =
    | InputMidiDeviceConnectedEvent
    | InputMidiDeviceDisconnectedEvent
    | OutputMidiDeviceConnectedEvent
    | OutputMidiDeviceDisconnectedEvent;

type CurrentMidiDeviceState = {
    connectedInputDevices: IMIDIInput[];
    connectedOutputDevices: IMIDIOutput[];
}

export type MidiDeviceChangeMessage = {
    state: CurrentMidiDeviceState;
    event: MidiDeviceChangeEvent;
}

export const getTextForEvent = (event: MidiDeviceChangeEvent): string => {
    switch (true) {
        case MidiEventMatchers.isInputConnectedEvent(event):
            return `Input connected:\n${event.device.name}`;
        case MidiEventMatchers.isInputDisconnectedEvent(event):
            return `Input disconnected:\n${event.device.name}`;
        case MidiEventMatchers.isOutputConnectedEvent(event):
            return `Output connected:\n${event.device.name}`;
        case MidiEventMatchers.isOutputDisconnectedEvent(event):
            return `Output disconnected:\n${event.device.name}`;
    }

    return `Unknown event type: ${event.type} for device: ${event.device.name}`;
}

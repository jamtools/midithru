import {IMIDIInput, MIDIVal} from '@midival/core';
import {MidiDeviceChangeEvent, MidiDeviceChangeMessage, MidiEventMatchers, getTextForEvent, isInputMidiDeviceConnectedEvent, isSameMidiDevice} from './types';

const p = MIDIVal.connect();

export const getInputs = async () => {
    const response = await p;
    knownConnectedInputDevices = response.inputs;
    return knownConnectedInputDevices;
};

let processing = false;

let events: MidiDeviceChangeEvent[] = [];
let knownConnectedInputDevices: IMIDIInput[] = [];

let callback = (message: MidiDeviceChangeMessage) => {
    console.log('Callback not set:', message);
};

export const setCallback = (cb: (message: MidiDeviceChangeMessage) => void) => {
    callback = cb;
};

const finishProcessing = () => {
    console.log(`Known connected input devices at finishProcessing: ${knownConnectedInputDevices.length}`)
    processing = false;
    events.forEach((event) => {
        if (MidiEventMatchers.isInputConnectedEvent(event)) {
            if (events.find((e) => MidiEventMatchers.isInputDisconnectedEvent(e) && isSameMidiDevice(event.device, e.device))) {
                return;
            }

            for (const knownDevice of knownConnectedInputDevices) {
                if (isSameMidiDevice(knownDevice, event.device)) {
                    return;
                }
            }

            console.log('Adding known connected input device:', event.device);
            knownConnectedInputDevices = [...knownConnectedInputDevices, event.device];
            console.log('Known connected input devices:', knownConnectedInputDevices);
            dispatchMessageForEvent(event);
        } else if (MidiEventMatchers.isInputDisconnectedEvent(event)) {
            if (events.find((e) => MidiEventMatchers.isInputConnectedEvent(e) && isSameMidiDevice(event.device, e.device))) {
                return;
            }

            console.log('Removing known connected input device:', event.device);
            knownConnectedInputDevices = knownConnectedInputDevices.filter((device) => !isSameMidiDevice(device, event.device));
            console.log('Known connected input devices:', knownConnectedInputDevices);
            dispatchMessageForEvent(event);
        }
    });

    events = [];
}

const dispatchMessageForEvent = (event: MidiDeviceChangeEvent) => {
    console.log('Dispatching message for event:', event);

    const message: MidiDeviceChangeMessage = {
        state: {
            connectedInputDevices: knownConnectedInputDevices,
            connectedOutputDevices: [],
        },
        event,
    };

    callback(message);
};

const processNewInputChange = () => {
    if (!processing) {
        processing = true;
        setTimeout(() => {
            finishProcessing();
        }, 400);
    }
}

MIDIVal.onInputDeviceConnected((input) => {
    processNewInputChange();

    events.push({
        type: 'input_connected',
        device: input,
    });
});

MIDIVal.onInputDeviceDisconnected((input) => {
    processNewInputChange();

    events.push({
        type: 'input_disconnected',
        device: input,
    });
});

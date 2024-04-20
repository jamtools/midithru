import {IMIDIInput, IMIDIOutput, MIDIVal} from '@midival/core';
import {MidiDeviceChangeEvent, MidiDeviceChangeMessage, MidiEventMatchers, getTextForEvents, isInputMidiDeviceConnectedEvent, isSameMidiDevice} from './types';

const midiConnectPromise = MIDIVal.connect();

export const getInputs = async () => {
    const response = await midiConnectPromise;
    knownConnectedInputDevices = response.inputs;
    return knownConnectedInputDevices;
};

let processing = false;

let events: MidiDeviceChangeEvent[] = [];
let knownConnectedInputDevices: IMIDIInput[] = [];
let knownConnectedOutputDevices: IMIDIOutput[] = [];

let callback = (message: MidiDeviceChangeMessage) => {
    console.log('Callback not set:', message);
};

export const setCallback = async (cb: (message: MidiDeviceChangeMessage) => void) => {
    const response = await midiConnectPromise;
    knownConnectedInputDevices = response.inputs;
    knownConnectedOutputDevices = response.outputs;

    callback = cb;
    cb({
        state: {
            connectedInputDevices: knownConnectedInputDevices,
            connectedOutputDevices: knownConnectedOutputDevices
        },
        event: undefined,
    });
};

const finishProcessing = () => {
    console.log(`Known connected input devices at finishProcessing: ${knownConnectedInputDevices.length}`)
    processing = false;

    const eventsToDispatch: MidiDeviceChangeEvent[] = [];
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

            eventsToDispatch.push(event);
        } else if (MidiEventMatchers.isInputDisconnectedEvent(event)) {
            if (events.find((e) => MidiEventMatchers.isInputConnectedEvent(e) && isSameMidiDevice(event.device, e.device))) {
                return;
            }

            console.log('Removing known connected input device:', event.device);
            knownConnectedInputDevices = knownConnectedInputDevices.filter((device) => !isSameMidiDevice(device, event.device));
            console.log('Known connected input devices:', knownConnectedInputDevices);

            eventsToDispatch.push(event);
        } else if (MidiEventMatchers.isOutputConnectedEvent(event)) {
            if (events.find((e) => MidiEventMatchers.isOutputDisconnectedEvent(e) && isSameMidiDevice(event.device, e.device))) {
                return;
            }

            for (const knownDevice of knownConnectedOutputDevices) {
                if (isSameMidiDevice(knownDevice, event.device)) {
                    return;
                }
            }

            console.log('Adding known connected output device:', event.device);
            knownConnectedOutputDevices = [...knownConnectedOutputDevices, event.device];
            console.log('Known connected output devices:', knownConnectedOutputDevices);

            eventsToDispatch.push(event);
        } else if (MidiEventMatchers.isOutputDisconnectedEvent(event)) {
            if (events.find((e) => MidiEventMatchers.isOutputConnectedEvent(e) && isSameMidiDevice(event.device, e.device))) {
                return;
            }

            console.log('Removing known connected output device:', event.device);
            knownConnectedOutputDevices = knownConnectedOutputDevices.filter((device) => !isSameMidiDevice(device, event.device));
            console.log('Known connected output devices:', knownConnectedOutputDevices);

            eventsToDispatch.push(event);
        }
    });

    dispatchMessageForEvent(eventsToDispatch);
    events = [];
}

const dispatchMessageForEvent = (events: MidiDeviceChangeEvent[]) => {
    console.log('Dispatching message for event:', event);

    const message: MidiDeviceChangeMessage = {
        state: {
            connectedInputDevices: knownConnectedInputDevices,
            connectedOutputDevices: knownConnectedOutputDevices,
        },
        events,
    };

    callback(message);
};

const processNewDeviceConnectionChange = () => {
    if (!processing) {
        processing = true;
        setTimeout(() => {
            finishProcessing();
        }, 400);
    }
}

MIDIVal.onInputDeviceConnected((input) => {
    processNewDeviceConnectionChange();

    events.push({
        type: 'input_connected',
        device: input,
    });
});

MIDIVal.onInputDeviceDisconnected((input) => {
    processNewDeviceConnectionChange();

    events.push({
        type: 'input_disconnected',
        device: input,
    });
});

MIDIVal.onOutputDeviceConnected((output) => {
    processNewDeviceConnectionChange();

    events.push({
        type: 'output_connected',
        device: output,
    });
});

MIDIVal.onOutputDeviceDisconnected((output) => {
    processNewDeviceConnectionChange();

    events.push({
        type: 'output_disconnected',
        device: output,
    });
});

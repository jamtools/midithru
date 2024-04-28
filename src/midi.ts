import {IMIDIAccess, MIDIVal, MIDIValInput, MIDIValOutput} from '@midival/core';
import {
    MidiDeviceChangeEvent,
    MidiDeviceChangeMessage,
    MidiEventMatchers,
    MidiInput,
    MidiOutput,
    isSameMidiDevice,
} from './types';

let midiConnectPromise: Promise<IMIDIAccess>;
try {
    midiConnectPromise = MIDIVal.connect();
} catch (e) {
    alert((e as Error)?.toString());
    throw e;
}

midiConnectPromise.catch(e => {
    alert(e.toString());
});

let processing = false;

let recordedEvents: MidiDeviceChangeEvent[] = [];
let knownConnectedInputDevices: MidiInput[] = [];
let knownConnectedOutputDevices: MidiOutput[] = [];

let callback = (message: MidiDeviceChangeMessage) => {
    console.log('Callback not set:', message);
};

export const setCallback = async (
    cb: (message: MidiDeviceChangeMessage) => void,
) => {
    const response = await midiConnectPromise;
    knownConnectedInputDevices = response.inputs.map(
        input => new MIDIValInput(input) as unknown as MidiInput,
    );
    knownConnectedOutputDevices = response.outputs.map(
        output => new MIDIValOutput(output) as unknown as MidiOutput,
    );

    callback = cb;
    cb({
        state: {
            connectedInputDevices: knownConnectedInputDevices,
            connectedOutputDevices: knownConnectedOutputDevices,
        },
        events: undefined,
    });
};

const finishProcessing = (events: MidiDeviceChangeEvent[]) => {
    console.log(
        `Known connected input devices at finishProcessing: ${knownConnectedInputDevices.length}`,
    );
    processing = false;

    const eventsToDispatch: MidiDeviceChangeEvent[] = [];
    events.forEach(event => {
        if (MidiEventMatchers.isInputConnectedEvent(event)) {
            if (
                events.find(
                    e =>
                        MidiEventMatchers.isInputDisconnectedEvent(e) &&
                        isSameMidiDevice(event.device, e.device),
                )
            ) {
                return;
            }

            for (const knownDevice of knownConnectedInputDevices) {
                if (isSameMidiDevice(knownDevice.midiInput, event.device)) {
                    return;
                }
            }

            console.log('Adding known connected input device:', event.device);
            knownConnectedInputDevices = [
                ...knownConnectedInputDevices,
                new MIDIValInput(event.device) as unknown as MidiInput,
            ];
            console.log(
                'Known connected input devices:',
                knownConnectedInputDevices,
            );

            eventsToDispatch.push(event);
        } else if (MidiEventMatchers.isInputDisconnectedEvent(event)) {
            if (
                events.find(
                    e =>
                        MidiEventMatchers.isInputConnectedEvent(e) &&
                        isSameMidiDevice(event.device, e.device),
                )
            ) {
                return;
            }

            console.log('Removing known connected input device:', event.device);
            knownConnectedInputDevices = knownConnectedInputDevices.filter(
                device => !isSameMidiDevice(device.midiInput, event.device),
            );
            console.log(
                'Known connected input devices:',
                knownConnectedInputDevices,
            );

            eventsToDispatch.push(event);
        } else if (MidiEventMatchers.isOutputConnectedEvent(event)) {
            if (
                events.find(
                    e =>
                        MidiEventMatchers.isOutputDisconnectedEvent(e) &&
                        isSameMidiDevice(event.device, e.device),
                )
            ) {
                return;
            }

            for (const knownDevice of knownConnectedOutputDevices) {
                if (isSameMidiDevice(knownDevice.midiOutput, event.device)) {
                    return;
                }
            }

            console.log('Adding known connected output device:', event.device);
            knownConnectedOutputDevices = [
                ...knownConnectedOutputDevices,
                new MIDIValOutput(event.device) as unknown as MidiOutput,
            ];
            console.log(
                'Known connected output devices:',
                knownConnectedOutputDevices,
            );

            eventsToDispatch.push(event);
        } else if (MidiEventMatchers.isOutputDisconnectedEvent(event)) {
            if (
                events.find(
                    e =>
                        MidiEventMatchers.isOutputConnectedEvent(e) &&
                        isSameMidiDevice(event.device, e.device),
                )
            ) {
                return;
            }

            console.log(
                'Removing known connected output device:',
                event.device,
            );
            knownConnectedOutputDevices = knownConnectedOutputDevices.filter(
                device => !isSameMidiDevice(device.midiOutput, event.device),
            );
            console.log(
                'Known connected output devices:',
                knownConnectedOutputDevices,
            );

            eventsToDispatch.push(event);
        }
    });

    dispatchMessageForEvent(eventsToDispatch);
};

const dispatchMessageForEvent = (events: MidiDeviceChangeEvent[]) => {
    console.log('Dispatching message for events:', events);

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
            finishProcessing(recordedEvents);
            recordedEvents = [];
        }, 400);
    }
};

MIDIVal.onInputDeviceConnected(input => {
    processNewDeviceConnectionChange();

    recordedEvents.push({
        type: 'input_connected',
        device: input,
    });
});

MIDIVal.onInputDeviceDisconnected(input => {
    processNewDeviceConnectionChange();

    recordedEvents.push({
        type: 'input_disconnected',
        device: input,
    });
});

MIDIVal.onOutputDeviceConnected(output => {
    processNewDeviceConnectionChange();

    recordedEvents.push({
        type: 'output_connected',
        device: output,
    });
});

MIDIVal.onOutputDeviceDisconnected(output => {
    processNewDeviceConnectionChange();

    recordedEvents.push({
        type: 'output_disconnected',
        device: output,
    });
});

import {IMIDIInput, MIDIVal} from '@midival/core';

const p = MIDIVal.connect();

export const getInputs = async () => {
    const response = await p;
    return response.inputs;
};

let processing = false;

type ConnectionEvent = {
    type: 'connect' | 'disconnect';
    input: IMIDIInput;
};

let events: ConnectionEvent[] = [];
let knownConnectedDevices: IMIDIInput[] = [];

let callback = (inputDevices: IMIDIInput[]) => {
};

const finishProcessing = () => {
    processing = false;
    events.forEach((event) => {
        if (event.type === 'connect') {
            if (events.find((e) => e.input.name === event.input.name && e.type === 'disconnect')) {
                return;
            }

            for (const knownDevice of knownConnectedDevices) {
                if (knownDevice.name === event.input.name) {
                    return;
                }
            }

            knownConnectedDevices.push(event.input);
            console.log('Input connected:', event.input.name);
        } else {
            if (events.find((e) => e.input.name === event.input.name && e.type === 'connect')) {
                return;
            }

            knownConnectedDevices = knownConnectedDevices.filter((device) => device.name !== event.input.name);
            console.log('Input disconnected:', event.input.name);
        }
    });

    events = [];
}

const processNewInputChange = () => {
    if (!processing) {
        // console.log('Processing new input change');

        processing = true;
        setTimeout(() => {
            finishProcessing();
        }, 200);
    }
}

MIDIVal.onInputDeviceConnected((input) => {
    processNewInputChange();

    events.push({
        type: 'connect',
        input,
    });
});

MIDIVal.onInputDeviceDisconnected((input) => {
    processNewInputChange();

    events.push({
        type: 'disconnect',
        input,
    });
});

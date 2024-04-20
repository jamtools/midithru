import {useEffect, useState} from 'react';

import {toast} from 'react-hot-toast';

import {setCallback} from '../midi';

import {
    CurrentMidiDeviceState,
    MidiEventMatchers,
    getTextForEvents,
} from '../types';

export const useMidi = (): CurrentMidiDeviceState => {
    const [midiDeviceState, setMidiDeviceState] =
        useState<CurrentMidiDeviceState>({
            connectedInputDevices: [],
            connectedOutputDevices: [],
        });

    useEffect(() => {
        (async () => {
            setCallback(message => {
                console.log('Message:', message);
                setMidiDeviceState(message.state);

                if (!message.events?.length) {
                    return;
                }

                const text = getTextForEvents(message.events);

                let backgroundColor: string | undefined;
                if (
                    message.events.find(
                        e =>
                            MidiEventMatchers.isInputConnectedEvent(e) ||
                            MidiEventMatchers.isOutputConnectedEvent(e),
                    )
                ) {
                    backgroundColor = 'green';
                }

                toast(text, {
                    duration: 4000,
                    style: {
                        backgroundColor,
                    },
                });
            });
        })();
    }, []);

    return midiDeviceState;
};

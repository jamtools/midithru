import React, {CSSProperties} from 'react';

import {Toaster, toast} from 'react-hot-toast';

import {setCallback} from './midi';
import {CurrentMidiDeviceState, MidiEventMatchers, getTextForEvents} from './types';

const useMidi = (): CurrentMidiDeviceState => {
    const [midiDeviceState, setMidiDeviceState] = React.useState<CurrentMidiDeviceState>({connectedInputDevices: [], connectedOutputDevices: []});

    React.useEffect(() => {
        (async () => {
            setCallback((message) => {
                console.log('Message:', message);
                setMidiDeviceState(message.state);

                if (!message.events?.length) {
                    return;
                }

                const text = getTextForEvents(message.events);

                let backgroundColor: string | undefined;
                if (message.events.find(e => MidiEventMatchers.isInputConnectedEvent(e) || MidiEventMatchers.isOutputConnectedEvent(e))) {
                    backgroundColor = 'green';
                }

                toast(text, {
                    duration: 2000,
                    style: {
                        backgroundColor,
                    },
                });
            });
        })();
    }, []);

    return midiDeviceState;
}

export const Main = () => {
    const midiState = useMidi();

    const instrumentContainerStyle: CSSProperties = {
        display: 'inline-block',
        border: '1px solid black',
        padding: '15px',
    }

    return (
        <div>
            <Toaster />
            <div style={instrumentContainerStyle}>
                <h2>Midi inputs:</h2>
                <ul>
                    {midiState.connectedInputDevices.map((device) => (
                        <li key={device.id}>
                            {device.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={instrumentContainerStyle}>
                <h2>Midi outputs:</h2>
                <ul>
                    {midiState.connectedOutputDevices.map((device) => (
                        <li key={device.id}>
                            {device.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

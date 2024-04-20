import {CSSProperties} from 'react';

import {Toaster} from 'react-hot-toast';

import {useMidi} from './hooks/useMidi';

export const Main = () => {
    const midiState = useMidi();

    const instrumentContainerStyle: CSSProperties = {
        display: 'inline-block',
        border: '1px solid black',
        padding: '15px',
    };

    return (
        <div>
            <Toaster />
            <div style={instrumentContainerStyle}>
                <h2>Midi inputs:</h2>
                <ul>
                    {midiState.connectedInputDevices.map(device => (
                        <li key={device.id}>{device.name}</li>
                    ))}
                </ul>
            </div>
            <div style={instrumentContainerStyle}>
                <h2>Midi outputs:</h2>
                <ul>
                    {midiState.connectedOutputDevices.map(device => (
                        <li key={device.id}>{device.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

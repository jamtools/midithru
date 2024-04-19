import React from 'react';

import {Toaster, toast} from 'react-hot-toast';

import {IMIDIInput} from '@midival/core';

import {getInputs, setCallback} from './midi';
import {getTextForEvent} from './types';

const useMidiInputs = (): IMIDIInput[] => {
    const [inputs, setInputs] = React.useState<IMIDIInput[]>([]);

    React.useEffect(() => {
        (async () => {
            const response = await getInputs();
            setInputs(response);
            setCallback((message) => {
                console.log('Message:', message);
                setInputs(message.state.connectedInputDevices);

                const text = getTextForEvent(message.event);
                toast(text, {
                    duration: 2000,
                    style: {
                        backgroundColor: message.event.type === 'input_connected' ? 'green' : undefined,
                    },
                });
            });
        })();
    }, []);

    return inputs;
}

export const Main = () => {
    const inputs = useMidiInputs();

    return (
        <div>
            <Toaster />
            <h2>Midi instruments:</h2>
            <ul>
                {inputs.map((input) => (
                    <li key={input.id}>
                        {input.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

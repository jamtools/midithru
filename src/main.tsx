import {IMIDIInput} from '@midival/core';
import React from 'react';
import {getInputs} from './midi';

export const Main = () => {
    const [inputs, setInputs] = React.useState<IMIDIInput[]>([]);

    React.useEffect(() => {
        (async () => {
            const response = await getInputs();
            setInputs(response);
        })();
    }, []);

    return (
        <div>
            <h2>Midi instruments:</h2>
            {inputs.map((input) => (
                <div key={input.id}>
                    {input.name}
                </div>
            ))}
        </div>
    );
};

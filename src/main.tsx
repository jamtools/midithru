import {CSSProperties, useEffect, useRef, useState} from 'react';

import {IMIDIInput, IMIDIOutput, MidiMessage} from '@midival/core';

import {Toaster} from 'react-hot-toast';

import {useMidi} from './hooks/useMidi';
import {useSavedData} from './hooks/useSavedData';

import {MidiInput, MidiOutput, isSameMidiDevice} from './types';

import './styles.scss';

export const Main = () => {
    const midiState = useMidi();
    const {savedData, updateMidiMappings} = useSavedData();

    const [selectedInput, setSelectedInput] = useState<MidiInput | null>(null);
    const selectedInputRef = useRef<IMIDIInput | null>(null);

    const [selectedOutput, setSelectedOutput] = useState<MidiOutput | null>(
        null,
    );
    const selectedOutputRef = useRef<IMIDIOutput | null>(null);

    const unregisterInputRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        console.log('Saved data:', savedData);
    }, [savedData]);

    const handleMidiInput = (message: Uint8Array) => {
        if (!selectedOutputRef.current) {
            return;
        }

        selectedOutputRef.current.send(message);
        // alert(`sent message ${message}`);
    };

    const queueInput = async (input: MidiInput) => {
        setSelectedInput(input);
        if (unregisterInputRef.current) {
            unregisterInputRef.current();
        }

        selectedInputRef.current = input.midiInput;

        unregisterInputRef.current = await input.midiInput.onMessage(
            message => {
                handleMidiInput(message.data);
            },
        );

        // save to local storage if necessary
    };

    const queueOutput = (device: MidiOutput) => {
        setSelectedOutput(device);
        selectedOutputRef.current = device.midiOutput;

        // save to local storage if necessary
    };

    return (
        <div>
            <Toaster />
            <div className='midiDeviceName'>
                <h2>Midi inputs:</h2>
                <ul>
                    {midiState.connectedInputDevices.map(device => (
                        <MidiDevice
                            key={device.midiInput.id}
                            device={device.midiInput}
                            onClick={() => queueInput(device)}
                            selected={Boolean(
                                selectedInput &&
                                    isSameMidiDevice(
                                        selectedInput.midiInput,
                                        device.midiInput,
                                    ),
                            )}
                        />
                    ))}
                </ul>
            </div>
            <div className='midiDeviceName'>
                <h2>Midi outputs:</h2>
                <ul>
                    {midiState.connectedOutputDevices.map(device => (
                        <MidiDevice
                            key={device.midiOutput.id}
                            device={device.midiOutput}
                            onClick={() => queueOutput(device)}
                            selected={Boolean(
                                selectedOutput &&
                                    isSameMidiDevice(
                                        selectedOutput.midiOutput,
                                        device.midiOutput,
                                    ),
                            )}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

type MidiDeviceProps = {
    device: IMIDIInput | IMIDIOutput;
    onClick: () => void;
    selected: boolean;
};

const MidiDevice = (props: MidiDeviceProps) => {
    const style: CSSProperties = {
        backgroundColor: props.selected ? 'lightblue' : 'white',
    };

    return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <nah>
        <li
            style={style}
            onClick={props.onClick}
        >
            {props.device.name}
        </li>
    );
};

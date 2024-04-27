import {CSSProperties, useEffect, useState} from 'react';

import {IMIDIInput, IMIDIOutput} from '@midival/core';

import {Toaster} from 'react-hot-toast';

import {useMidi} from './hooks/useMidi';
import {useSavedData} from './hooks/useSavedData';

import './styles.scss';
import {MidiDeviceDescriptor, isSameMidiDevice} from './types';

export const Main = () => {
    const midiState = useMidi();
    const savedData = useSavedData();

    const [selectedInput, setSelectedInput] =
        useState<MidiDeviceDescriptor | null>(null);
    const [selectedOutput, setSelectedOutput] =
        useState<MidiDeviceDescriptor | null>(null);

    useEffect(() => {
        console.log('Saved data:', savedData);
    }, [savedData]);

    const queueInput = (device: MidiDeviceDescriptor) => {
        setSelectedInput(device);
        const input = midiState.connectedInputDevices.find(d =>
            isSameMidiDevice(d.midiInput, device),
        );
        if (!input) {
            return;
        }
    };

    const queueOutput = (device: MidiDeviceDescriptor) => {
        setSelectedOutput(device);
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
                            onClick={() => queueInput(device.midiInput)}
                            selected={Boolean(
                                selectedInput &&
                                    isSameMidiDevice(
                                        selectedInput,
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
                            onClick={() => queueOutput(device.midiOutput)}
                            selected={Boolean(
                                selectedOutput &&
                                    isSameMidiDevice(
                                        selectedOutput,
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

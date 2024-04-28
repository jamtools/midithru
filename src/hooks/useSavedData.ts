import {useEffect, useMemo, useState} from 'react';
import {MidiDeviceDescriptor, isSameMidiDevice} from '../types';

type MidiMapping = {
    input: MidiDeviceDescriptor;
    output: MidiDeviceDescriptor;
};

type SavedData = {
    mappings: MidiMapping[];
};

const getDataFromLocalStorage = <T>(key: string): T | undefined => {
    const savedData = localStorage.getItem(key);
    if (!savedData) {
        return undefined;
    }

    return JSON.parse(savedData) as T;
};

const saveDataToLocalStorage = <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const initialState: SavedData = {
    mappings: [],
};

const savedDataLocalStorageKey = 'saved-data';

export const useSavedData = () => {
    const [savedData, setSavedData] = useState<SavedData>(initialState);

    useEffect(() => {
        const persistedDataFromLocalStorage =
            getDataFromLocalStorage<SavedData>(savedDataLocalStorageKey);
        if (!persistedDataFromLocalStorage) {
            return;
        }

        setSavedData(persistedDataFromLocalStorage);
    }, []);

    return useMemo(
        () => ({
            savedData,
            updateMidiMappings: (
                input: MidiDeviceDescriptor,
                output: MidiDeviceDescriptor,
            ) => {
                if (
                    savedData.mappings.some(
                        mapping =>
                            isSameMidiDevice(mapping.input, input) &&
                            isSameMidiDevice(mapping.output, output),
                    )
                ) {
                    return;
                }

                const newMappings = [
                    ...savedData.mappings,
                    {
                        input,
                        output,
                    },
                ];

                setSavedData(savedData => {
                    const newData = {
                        ...savedData,
                        mappings: newMappings,
                    };

                    saveDataToLocalStorage(savedDataLocalStorageKey, newData);

                    return newData;
                });
            },
        }),
        [savedData],
    );
};

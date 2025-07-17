// hooks/useGlobalPlayer.tsx - HOOK PARA PLAYER GLOBAL
import React from 'react';
import { FloatingAudioPlayer } from '../components/FloatingAudioPlayer';
import { usePlayer } from './useAudio';

export const GlobalPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentEpisode } = usePlayer();

    return (
        <>
            {children}
            {/* Player aparece sobre todo o conteúdo */}
            {currentEpisode && (
                <FloatingAudioPlayer />
            )}
        </>
    );
};
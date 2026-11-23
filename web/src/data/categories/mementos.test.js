/**
 * Hearts Memento: which Old Heart is the memento (hand-made playerData; the
 * fixture and golden tests cover real saves).
 */
import { describe, it, expect } from 'vitest';
import { makeContext } from './index.js';
import { parseCollection } from './collection.js';

const HEART_FLAGS = ['CollectedHeartCoral', 'CollectedHeartFlower', 'CollectedHeartHunter', 'CollectedHeartClover'];
const flags = (...on) => Object.fromEntries(HEART_FLAGS.map(f => [f, on.includes(f)]));
const named = (list) => ({ savedData: Object.entries(list).map(([Name, Data]) => ({ Name, Data })) });

function heartsMemento(playerData) {
    const save = { playerData, sceneData: {} };
    return parseCollection(save, makeContext(save)).mementos.find(m => m.id === 'hearts-memento');
}

describe('Hearts Memento', () => {
    it('stays generic while fewer than three hearts are collected', () => {
        const m = heartsMemento(flags('CollectedHeartCoral'));
        expect(m.display).toBe('Hearts Memento');
        expect(m.icon).toBe('memento_heart_clover0000.png');
        expect(m.obtained).toBe(false);
    });

    it('with three hearts, the missing one will be the memento', () => {
        const m = heartsMemento(flags('CollectedHeartCoral', 'CollectedHeartHunter', 'CollectedHeartClover'));
        expect(m.display).toBe('Hearts Memento (Pollen Heart)');
        expect(m.icon).toBe('memento_heart_shellwood0000.png');
        expect(m.obtained).toBe(false);
    });

    it('a deposited heart is the memento', () => {
        const m = heartsMemento({
            ...flags(...HEART_FLAGS),
            MementosDeposited: named({ 'Hunter Heart': { IsDeposited: true } }),
        });
        expect(m.display).toBe("Hearts Memento (Hunter's Heart)");
        expect(m.icon).toBe('memento_heart_ant0000.png');
        expect(m.deposited).toBe(true);
    });

    it('with all four and none deposited, the one still carried is the memento', () => {
        const m = heartsMemento({
            ...flags(...HEART_FLAGS),
            Collectables: named({ 'Coral Heart': { Amount: 1 }, 'Clover Heart': { Amount: 0 } }),
        });
        expect(m.display).toBe('Hearts Memento (Encrusted Heart)');
        expect(m.obtained).toBe(true);
    });

    it('with all four and nothing to tell them apart, it is the Conjoined Heart', () => {
        const m = heartsMemento(flags(...HEART_FLAGS));
        expect(m.display).toBe('Hearts Memento (Conjoined Heart)');
        expect(m.icon).toBe('memento_heart_clover0000.png');
    });
});

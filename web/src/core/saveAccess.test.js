import { describe, it, expect } from 'vitest';
import { flag, savedDataEntries, savedDataByName, questCompleted, scenePickup, persistentInt } from './saveAccess.js';

const pd = {
    geo: 5,
    Tools: { savedData: [{ Name: 'Straight Pin', Data: { IsUnlocked: true } }, { Name: 'Tri Pin', Data: { IsUnlocked: false } }] },
    EnemyJournalKillData: { list: [{ Name: 'MossBone Crawler', Record: { HasBeenSeen: true, Kills: 3 } }] },
    QuestCompletionData: { savedData: [{ Name: 'Journal', Data: { IsCompleted: true } }, { Name: 'Crow Feathers', Data: { IsCompleted: false } }] },
};
const sd = {
    persistentBools: { serializedList: [{ SceneName: 'Bone_East_20', ID: 'Heart Piece', Value: true }] },
    persistentInts: { serializedList: [{ SceneName: 'Tut_01', ID: 'Shell Shard Fossil', Value: 3 }] },
};

describe('saveAccess', () => {
    it('flag reads top-level keys and tolerates a missing object', () => {
        expect(flag(pd, 'geo')).toBe(5);
        expect(flag(pd, 'nope')).toBeUndefined();
        expect(flag(undefined, 'geo')).toBeUndefined();
    });

    it('savedDataEntries handles savedData, list/Record, and missing containers', () => {
        expect(savedDataEntries(pd.Tools)).toEqual([
            { name: 'Straight Pin', data: { IsUnlocked: true } },
            { name: 'Tri Pin', data: { IsUnlocked: false } },
        ]);
        expect(savedDataEntries(pd.EnemyJournalKillData)).toEqual([{ name: 'MossBone Crawler', data: { HasBeenSeen: true, Kills: 3 } }]);
        expect(savedDataEntries(undefined)).toEqual([]);
        expect(savedDataEntries({ savedData: 'bad' })).toEqual([]);
    });

    it('savedDataByName maps name to data', () => {
        expect(savedDataByName(pd.Tools).get('Straight Pin')).toEqual({ IsUnlocked: true });
        expect(savedDataByName(null).size).toBe(0);
    });

    it('questCompleted', () => {
        expect(questCompleted(pd, 'Journal')).toBe(true);
        expect(questCompleted(pd, 'Crow Feathers')).toBe(false);
        expect(questCompleted(pd, 'Missing')).toBe(false);
        expect(questCompleted({}, 'Journal')).toBe(false);
    });

    it('scenePickup and persistentInt', () => {
        expect(scenePickup(sd, 'Bone_East_20', 'Heart Piece')).toBe(true);
        expect(scenePickup(sd, 'Bone_East_20', 'Silk Spool')).toBe(false);
        expect(scenePickup(undefined, 'x', 'y')).toBe(false);
        expect(persistentInt(sd, 'Tut_01', 'Shell Shard Fossil')).toBe(3);
        expect(persistentInt(sd, 'Tut_01', 'none')).toBeUndefined();
    });
});

import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearDefaultFromStation,
  getPreferences,
  setDefaultFromStation,
} from './preferencesStore';
describe('preferencesStore', () => {
  beforeEach(() => {
    clearDefaultFromStation();
    window.localStorage.clear();
  });
  it('starts with no default From station', () => {
    expect(getPreferences()).toEqual({
      defaultFromStationCode: null,
      defaultFromStationName: null,
    });
  });
  it('setDefaultFromStation() stores the code and name', () => {
    setDefaultFromStation('NDLS', 'New Delhi');
    expect(getPreferences()).toEqual({
      defaultFromStationCode: 'NDLS',
      defaultFromStationName: 'New Delhi',
    });
  });
  it('setDefaultFromStation() overwrites a previous selection', () => {
    setDefaultFromStation('NDLS', 'New Delhi');
    setDefaultFromStation('HWH', 'Howrah Jn');
    expect(getPreferences()).toEqual({
      defaultFromStationCode: 'HWH',
      defaultFromStationName: 'Howrah Jn',
    });
  });
  it('clearDefaultFromStation() resets to the default', () => {
    setDefaultFromStation('NDLS', 'New Delhi');
    clearDefaultFromStation();
    expect(getPreferences()).toEqual({
      defaultFromStationCode: null,
      defaultFromStationName: null,
    });
  });
});

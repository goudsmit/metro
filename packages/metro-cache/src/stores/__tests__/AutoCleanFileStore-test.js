/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+metro_bundler
 * @format
 * @flow
 */

'use strict';

describe('AutoCleanFileStore', () => {
  let AutoCleanFileStore;
  let fs;

  beforeEach(() => {
    jest
      .resetModules()
      .resetAllMocks()
      .useFakeTimers()
      .mock('fs', () => new (require('metro-memory-fs'))());

    AutoCleanFileStore = require('../AutoCleanFileStore');
    fs = require('fs');
    jest.spyOn(fs, 'unlinkSync');
  });

  it('sets and writes into the cache', async () => {
    const fileStore = new AutoCleanFileStore({
      root: '/root',
      intervalMs: 49,
      cleanupThresholdMs: 0,
    });
    const cache = Buffer.from([0xfa, 0xce, 0xb0, 0x0c]);

    await fileStore.set(cache, {foo: 42});
    expect(await fileStore.get(cache)).toEqual({foo: 42});

    jest.runTimersToTime(30);

    expect(await fileStore.get(cache)).toEqual({foo: 42});

    jest.runTimersToTime(40);

    // mtime doesn't work very well in in-memory-store, so we couldn't test that
    // functionality
    expect(await fileStore.get(cache)).toEqual(null);
  });

  it('returns null when reading a non-existing file', async () => {
    const fileStore = new AutoCleanFileStore({root: '/root'});
    const cache = Buffer.from([0xfa, 0xce, 0xb0, 0x0c]);

    expect(await fileStore.get(cache)).toEqual(null);
  });
});

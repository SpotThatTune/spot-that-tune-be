const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');

describe('spot-that-tune-be routes', () => {
  // beforeEach(() => {
  //   return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  // });
  it('passes the test', () => {
    expect(true).toEqual(true);
  });
});

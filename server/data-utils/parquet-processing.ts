import * as parquet from 'parquetjs';
import { fill, zipObject } from 'lodash';

import * as p from '../types';

import { expandPollingData, flattenPollingData } from './polling-operations';
import { schematizeCandidateNames } from '../util/common';

const OUTPUT_FILE_PATH = 'polls.parquet';

export const writePollingDataToParquet = async (pollingData: p.PollingData): Promise<string> => {
  const expandedPollingData = expandPollingData(pollingData);
  const pollingDataSchema = new parquet.ParquetSchema(buildParquetSchema(expandedPollingData));
  const flattenedPollingData = flattenPollingData(expandedPollingData);

  try {
    const writer = await parquet.ParquetWriter.openFile(pollingDataSchema, OUTPUT_FILE_PATH);

    for (const flatPoll of flattenedPollingData) {
      await writer.appendRow(flatPoll);
    }

    await writer.close();
  } catch (e) {
    console.error(e);
  }

  return OUTPUT_FILE_PATH;
};

const buildParquetSchema = (expandedPollingData: p.ExpandedPoll[]): p.ParquetSchema => {
  const STRING_TYPE = { type: 'UTF8' };
  const DATE_TYPE = { type: 'TIMESTAMP_MILLIS' };
  const NUMBER_TYPE = { type: 'INT64' };
  const DOUBLE_TYPE = { type: 'DOUBLE' };

  const candidateList = schematizeCandidateNames(Object.keys(expandedPollingData[0].candidateResults));
  const candidateSchema = zipObject(candidateList, fill(Array(candidateList.length), DOUBLE_TYPE));

  return {
    state: STRING_TYPE,
    date: DATE_TYPE,
    sample_size: NUMBER_TYPE,
    margin_of_error: DOUBLE_TYPE,
    ...candidateSchema
  };
};

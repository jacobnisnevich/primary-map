import { Table, Schema, Field, DataType, Type, Utf8Vector, DateVector, Int32Vector, Float32Vector } from 'apache-arrow';
import * as p from '../types';

import { expandPollingData, flattenPollingData } from './polling-operations';
import { schematizeCandidateNames } from '../util/common';

const OUTPUT_FILE_PATH = 'polls.arrow';

export const writePollingDataToArrow = async (pollingData: p.PollingData): Promise<string> => {
  const expandedPollingData = expandPollingData(pollingData);
  const candidateList = schematizeCandidateNames(Object.keys(expandedPollingData[0].candidateResults));
  const flatPollingData = flattenPollingData(expandedPollingData);

  const candidateDataColumns = candidateList.map((candidateName: string) =>
    Float32Vector.from(new Float32Array(flatPollingData.map((p: p.FlatPoll) => p[candidateName])))
  );

  const pollingDataColumns = [
    Utf8Vector.from(flatPollingData.map((p: p.FlatPoll) => p.state)),
    DateVector.from(flatPollingData.map((p: p.FlatPoll) => p.date)),
    Int32Vector.from(flatPollingData.map((p: p.FlatPoll) => p.sample_size)),
    Float32Vector.from(flatPollingData.map((p: p.FlatPoll) => p.margin_of_error)),
    ...candidateDataColumns
  ];

  const table = Table.new(pollingDataColumns, Object.keys(flatPollingData[0]));
  console.log(table.length);

  return OUTPUT_FILE_PATH;
};

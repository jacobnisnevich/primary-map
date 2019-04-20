import axios from 'axios';
import { zipObject } from 'lodash';

import * as p from '../types';

import { candidateCommitteeIds } from '../util/candidate-financials';

export const getFinancialDataForCandidates = async (): Promise<p.CandidateFinancialData> => {
  const candidates = Object.keys(candidateCommitteeIds).filter(
    (candidate: p.Candidate) => candidateCommitteeIds[candidate] !== undefined
  );

  const financialData = await Promise.all(
    candidates.map((candidate: p.Candidate) => getFinancialDataForCandidate(candidateCommitteeIds[candidate]))
  );

  return zipObject(candidates, financialData);
};

const getFinancialDataForCandidate = async (committeeId: string): Promise<p.FinancialData> => {
  const fecApiKey = process.env.FEC_API_KEY;
  const fecDataUrl = `https://api.open.fec.gov/v1/committee/${committeeId}/totals?api_key=${fecApiKey}`;

  const candidateFinancialReports = await axios.get(fecDataUrl);

  return candidateFinancialReports.data.results.map(report => ({
    raised: report.receipts,
    spent: report.disbursements,
    filingDate: new Date(report.coverage_end_date)
  }));
};

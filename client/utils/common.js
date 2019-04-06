export const formatPercentage = percentage => `${parseFloat(percentage).toFixed(1)}%`;

export const formatPercentageForTable = percentage => {
  if (percentage === '-') {
    return '-';
  } else {
    return `${parseFloat(percentage)}%`;
  }
};

export const getColorForCandidate = (candidateName, palette) => {
  return `rgba(${palette[candidateName]._rgb.join(', ')})`;
};

export const fixMessedUpName = candidateName => {
  if (candidateName === 'Joe Kennedy Iii') {
    return 'Joe Kennedy III';
  } else if (candidateName === 'Beto O Rourke') {
    return "Beto O'Rourke";
  } else {
    return candidateName;
  }
};

export const getColumnFormatter = columnType => {
  return {
    date: text => new Date(text).toLocaleDateString(),
    sample_size: text => text,
    margin_of_error: text => (text === '0' ? '-' : text),
    state: text => text,
    joe_biden: text => formatPercentageForTable(text),
    cory_booker: text => formatPercentageForTable(text),
    pete_buttigieg: text => formatPercentageForTable(text),
    kamala_harris: text => formatPercentageForTable(text),
    beto_o_rourke: text => formatPercentageForTable(text),
    bernie_sanders: text => formatPercentageForTable(text),
    elizabeth_warren: text => formatPercentageForTable(text),
    oprah_winfrey: text => formatPercentageForTable(text),
    sherrod_brown: text => formatPercentageForTable(text),
    amy_klobuchar: text => formatPercentageForTable(text),
    deval_patrick: text => formatPercentageForTable(text),
    andrew_yang: text => formatPercentageForTable(text),
    joe_kennedy_iii: text => formatPercentageForTable(text)
  }[columnType];
};

export const formatPercentage = percentage => `${parseFloat(percentage).toFixed(1)}%`;

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
    joe_biden: text => formatPercentage(text),
    cory_booker: text => formatPercentage(text),
    pete_buttigieg: text => formatPercentage(text),
    kamala_harris: text => formatPercentage(text),
    beto_o_rourke: text => formatPercentage(text),
    bernie_sanders: text => formatPercentage(text),
    elizabeth_warren: text => formatPercentage(text),
    oprah_winfrey: text => formatPercentage(text),
    sherrod_brown: text => formatPercentage(text),
    amy_klobuchar: text => formatPercentage(text),
    deval_patrick: text => formatPercentage(text),
    andrew_yang: text => formatPercentage(text),
    joe_kennedy_iii: text => formatPercentage(text)
  }[columnType];
};

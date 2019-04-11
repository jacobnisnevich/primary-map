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
    state: text => text.replace('New Hampshire', 'N. Hampshire')
  }[columnType];
};

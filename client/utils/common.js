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

export const formatColumnHeader = columnHeader => {
  if (columnHeader === 'Polling Source') {
    return 'Pollster';
  } else if (columnHeader === 'Date') {
    return 'Poll Date';
  } else if (columnHeader === 'Margin Of Error') {
    return 'MoE';
  } else if (columnHeader === 'Sample Size') {
    return 'Sample';
  } else if (columnHeader === 'State') {
    return 'State';
  } else {
    const fixedName = fixMessedUpName(columnHeader);
    return fixedName.split(' ')[1];
  }
};

export const getColumnFormatter = columnType => {
  return {
    polling_source: text => text,
    date: text => new Date(text).toDateString(),
    sample_size: text => text,
    margin_of_error: text => (text === '0' ? '-' : text),
    state: text => (text === '' ? '-' : text)
  }[columnType];
};

export const formatCurrency = number => {
  return `$${number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

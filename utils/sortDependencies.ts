export default function sortDependencies(packageJSON) {
  const depTypes = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ];
  const sortedResult = {};

  for (const depType of depTypes) {
    if (packageJSON[depType]) {
      sortedResult[depType] = {};

      Object.keys(packageJSON[depType])
        .sort()
        .forEach((name) => {
          sortedResult[depType][name] = packageJSON[depType][name];
        });
    }
  }

  return {
    ...packageJSON,
    ...sortedResult,
  };
}
